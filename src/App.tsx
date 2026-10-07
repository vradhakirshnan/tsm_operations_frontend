import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { OperationsOverview } from './domains/overview/OperationsOverview';
import { CustomerManagementPage } from './domains/customer/CustomerManagementPage';
import { MenuManagementPage } from './domains/menu/MenuManagementPage';
import { OrderManagementPage } from './domains/orders/OrderManagementPage';
import { KitchenDashboardPage } from './domains/kitchen/KitchenDashboardPage';
import { InventoryManagementPage } from './domains/inventory/InventoryManagementPage';
import { DispatchManagementPage } from './domains/dispatch/DispatchManagementPage';
import { ReconciliationPage } from './domains/reconciliation/ReconciliationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OperationsOverview />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="kitchen" element={<KitchenDashboardPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="dispatch" element={<DispatchManagementPage />} />
            <Route path="reconciliation" element={<ReconciliationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
