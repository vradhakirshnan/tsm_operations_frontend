export type KitchenEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_CANCELLED'
  | 'KITCHEN_ALERT'
  | 'BILL_GENERATED'
  | 'TASK_PROGRESS'
  | 'HEARTBEAT'
  | 'INVENTORY_LOW'
  | 'DISPATCH_READY';

export interface SSEMessagePayload<T = Record<string, unknown>> {
  event: KitchenEventType;
  channel: string;
  data: T;
  timestamp: string;
}

export type SSEConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
