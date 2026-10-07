import { useEffect, useRef, useState, useCallback } from 'react';
import { KitchenEventType, SSEConnectionState, SSEMessagePayload } from '../types';

export interface UseSSEOptions {
  url?: string;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  initialRetryDelayMs?: number;
  maxRetryDelayMs?: number;
  heartbeatTimeoutMs?: number;
  enableSimulationFallback?: boolean;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: SSEMessagePayload) => void;
  events?: {
    [key in KitchenEventType]?: (data: unknown) => void;
  };
}

export interface UseSSEReturn {
  connectionState: SSEConnectionState;
  lastMessage: SSEMessagePayload | null;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const DEFAULT_SSE_URL = import.meta.env.VITE_SSE_URL || '/api/v1/events/kitchen';

export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const {
    url = DEFAULT_SSE_URL,
    autoConnect = true,
    maxReconnectAttempts = 10,
    initialRetryDelayMs = 1500,
    maxRetryDelayMs = 30000,
    heartbeatTimeoutMs = 45000,
    enableSimulationFallback = true,
    onOpen,
    onError,
    onMessage,
    events,
  } = options;

  const [connectionState, setConnectionState] = useState<SSEConnectionState>('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<SSEMessagePayload | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const isManuallyClosedRef = useRef<boolean>(false);
  const attemptsRef = useRef<number>(0);

  const resetHeartbeatWatchdog = useCallback(() => {
    if (heartbeatTimerRef.current) {
      window.clearTimeout(heartbeatTimerRef.current);
    }
    heartbeatTimerRef.current = window.setTimeout(() => {
      // If no heartbeat received within timeout window, trigger reconnect
      console.warn('[SSE] Heartbeat timed out. Reconnecting...');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnectionState('ERROR');
      scheduleReconnect();
    }, heartbeatTimeoutMs);
  }, [heartbeatTimeoutMs]);

  const scheduleReconnect = useCallback(() => {
    if (isManuallyClosedRef.current) return;
    if (attemptsRef.current >= maxReconnectAttempts) {
      console.warn(`[SSE] Max reconnect attempts reached (${maxReconnectAttempts}). Halting.`);
      setConnectionState('DISCONNECTED');
      return;
    }

    // Exponential backoff with jitter
    const delay = Math.min(
      initialRetryDelayMs * Math.pow(1.5, attemptsRef.current) + Math.random() * 1000,
      maxRetryDelayMs
    );

    attemptsRef.current += 1;
    setReconnectAttempts(attemptsRef.current);
    setConnectionState('CONNECTING');

    console.info(`[SSE] Reconnecting in ${Math.round(delay)}ms (attempt ${attemptsRef.current}/${maxReconnectAttempts})...`);

    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = window.setTimeout(() => {
      initConnection();
    }, delay);
  }, [initialRetryDelayMs, maxRetryDelayMs, maxReconnectAttempts]);

  const startSimulationFallback = useCallback(() => {
    if (!enableSimulationFallback) return;
    if (simulationIntervalRef.current) return;

    // In demo/offline mode where backend SSE is not reached, simulate periodic operational events
    simulationIntervalRef.current = window.setInterval(() => {
      const mockEvents: SSEMessagePayload[] = [
        {
          event: 'HEARTBEAT',
          channel: 'kitchen:all',
          data: { ping: 'ok', server_time: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        },
        {
          event: 'KITCHEN_ALERT',
          channel: 'kitchen:all',
          data: {
            message: 'Urgent: Table 4 Dum Biryani needs priority dispatch packaging',
            priority: 'medium',
          },
          timestamp: new Date().toISOString(),
        },
      ];

      const chosen = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setLastMessage(chosen);
      onMessage?.(chosen);
      if (events?.[chosen.event]) {
        events[chosen.event]?.(chosen.data);
      }
    }, 25000);
  }, [enableSimulationFallback, onMessage, events]);

  const stopSimulationFallback = useCallback(() => {
    if (simulationIntervalRef.current) {
      window.clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  }, []);

  const initConnection = useCallback(() => {
    if (isManuallyClosedRef.current) return;

    // Clean up previous instance if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionState('CONNECTING');

    try {
      const es = new EventSource(url, { withCredentials: false });
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionState('CONNECTED');
        attemptsRef.current = 0;
        setReconnectAttempts(0);
        resetHeartbeatWatchdog();
        stopSimulationFallback();
        onOpen?.();
        console.info(`[SSE] Connected to ${url}`);
      };

      es.onmessage = (event: MessageEvent) => {
        resetHeartbeatWatchdog();
        try {
          const parsed: SSEMessagePayload = JSON.parse(event.data);
          setLastMessage(parsed);
          onMessage?.(parsed);

          if (parsed.event && events?.[parsed.event]) {
            events[parsed.event]?.(parsed.data);
          }
        } catch {
          // Plain text message
          const rawPayload: SSEMessagePayload = {
            event: 'TASK_PROGRESS',
            channel: 'kitchen:all',
            data: { message: event.data },
            timestamp: new Date().toISOString(),
          };
          setLastMessage(rawPayload);
          onMessage?.(rawPayload);
        }
      };

      // Listen for domain-specific events emitted by FastAPI SSE manager
      const standardEvents: KitchenEventType[] = [
        'ORDER_CREATED',
        'ORDER_STATUS_CHANGED',
        'ORDER_CANCELLED',
        'KITCHEN_ALERT',
        'BILL_GENERATED',
        'TASK_PROGRESS',
        'HEARTBEAT',
        'INVENTORY_LOW',
        'DISPATCH_READY',
      ];

      standardEvents.forEach((evtType) => {
        es.addEventListener(evtType, (event: MessageEvent) => {
          resetHeartbeatWatchdog();
          try {
            const parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            const messagePayload: SSEMessagePayload = {
              event: evtType,
              channel: parsedData.channel || 'kitchen:all',
              data: parsedData.data || parsedData,
              timestamp: parsedData.timestamp || new Date().toISOString(),
            };
            setLastMessage(messagePayload);
            onMessage?.(messagePayload);
            if (events?.[evtType]) {
              events[evtType]?.(messagePayload.data);
            }
          } catch {
            const rawPayload: SSEMessagePayload = {
              event: evtType,
              channel: 'kitchen:all',
              data: { message: event.data },
              timestamp: new Date().toISOString(),
            };
            setLastMessage(rawPayload);
            onMessage?.(rawPayload);
            if (events?.[evtType]) {
              events[evtType]?.(rawPayload.data);
            }
          }
        });
      });

      es.onerror = (err) => {
        setConnectionState('ERROR');
        onError?.(err);

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Enable fallback simulation while reconnecting so executive UI stays alive
        startSimulationFallback();
        scheduleReconnect();
      };
    } catch (err) {
      console.error('[SSE] Failed to initialize EventSource:', err);
      setConnectionState('ERROR');
      startSimulationFallback();
      scheduleReconnect();
    }
  }, [
    url,
    resetHeartbeatWatchdog,
    stopSimulationFallback,
    onOpen,
    onMessage,
    events,
    onError,
    scheduleReconnect,
    startSimulationFallback,
  ]);

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimerRef.current) {
      window.clearTimeout(heartbeatTimerRef.current);
    }
    stopSimulationFallback();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionState('DISCONNECTED');
  }, [stopSimulationFallback]);

  const connect = useCallback(() => {
    isManuallyClosedRef.current = false;
    attemptsRef.current = 0;
    setReconnectAttempts(0);
    initConnection();
  }, [initConnection]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    isConnected: connectionState === 'CONNECTED',
  };
}
