import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { useSSE } from '../../hooks/useSSE';
import { useKitchenStore } from '../../store/kitchenStore';
import { useUIStore } from '../../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addAlertFromSSE } = useKitchenStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { connectionState, reconnectAttempts, connect } = useSSE({
    onOpen: () => {
      addToast({
        type: 'success',
        title: 'Real-time Link Established',
        message: 'Connected to Kitchen Operations SSE channel.',
      });
    },
    onMessage: (message) => {
      addAlertFromSSE(message);

      // Invalidate relevant TanStack Query caches based on SSE events
      if (message.event === 'ORDER_CREATED' || message.event === 'ORDER_STATUS_CHANGED') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['kitchen_indents'] });
        queryClient.invalidateQueries({ queryKey: ['prep_board'] });
      } else if (message.event === 'KITCHEN_ALERT') {
        addToast({
          type: 'warning',
          title: 'Kitchen Alert',
          message: typeof message.data === 'object' && message.data && 'message' in message.data
            ? String((message.data as { message: unknown }).message)
            : 'New urgent alert from kitchen floor',
        });
      }
    },
  });

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          connectionState={connectionState}
          reconnectAttempts={reconnectAttempts}
          onReconnect={connect}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};
