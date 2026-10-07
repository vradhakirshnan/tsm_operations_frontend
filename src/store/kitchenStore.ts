import { create } from 'zustand';
import { SSEMessagePayload } from '../types';

export interface KitchenAlert {
  id: string;
  timestamp: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  orderId?: string;
}

interface KitchenState {
  liveAlerts: KitchenAlert[];
  unreadAlertCount: number;
  addAlertFromSSE: (payload: SSEMessagePayload) => void;
  markAllAlertsAsRead: () => void;
  clearAlerts: () => void;
  selectedStationFilter: string;
  setSelectedStationFilter: (station: string) => void;
}

export const useKitchenStore = create<KitchenState>((set) => ({
  liveAlerts: [
    {
      id: 'alt-1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      message: 'New bulk order ORD-2026-1002 received from Swiggy (3x Biryani)',
      priority: 'high',
      read: false,
      orderId: 'ORD-2026-1002',
    },
    {
      id: 'alt-2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      message: 'Paneer stock low in main chill-room (12 kg remaining)',
      priority: 'urgent',
      read: false,
    },
  ],
  unreadAlertCount: 2,
  addAlertFromSSE: (payload) => {
    const rawData = payload.data as { message?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; order_id?: string };
    const alert: KitchenAlert = {
      id: `sse-${Date.now()}`,
      timestamp: payload.timestamp || new Date().toISOString(),
      message: rawData?.message || `Event received: ${payload.event}`,
      priority: rawData?.priority || 'medium',
      read: false,
      orderId: rawData?.order_id,
    };
    set((state) => ({
      liveAlerts: [alert, ...state.liveAlerts.slice(0, 49)],
      unreadAlertCount: state.unreadAlertCount + 1,
    }));
  },
  markAllAlertsAsRead: () =>
    set((state) => ({
      liveAlerts: state.liveAlerts.map((a) => ({ ...a, read: true })),
      unreadAlertCount: 0,
    })),
  clearAlerts: () =>
    set({
      liveAlerts: [],
      unreadAlertCount: 0,
    }),
  selectedStationFilter: 'all',
  setSelectedStationFilter: (station) => set({ selectedStationFilter: station }),
}));
