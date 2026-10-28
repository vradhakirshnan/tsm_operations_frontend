import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './domains/auth/LoginPage';
import { AuthCallbackPage } from './domains/auth/AuthCallbackPage';
import { UserManagementDashboard } from './domains/admin/UserManagementDashboard';
import { OperationsOverview } from './domains/overview/OperationsOverview';
import { OperationsManagerDashboard } from './domains/overview/OperationsManagerDashboard';
import { CustomerManagementPage } from './domains/customer/CustomerManagementPage';
import { MenuManagementPage } from './domains/menu/MenuManagementPage';
import { OrderManagementPage } from './domains/orders/OrderManagementPage';
import { KitchenDashboardPage } from './domains/kitchen/KitchenDashboardPage';
import { InventoryManagementPage } from './domains/inventory/InventoryManagementPage';
import { DispatchManagementPage } from './domains/dispatch/DispatchManagementPage';
import { ReconciliationPage } from './domains/reconciliation/ReconciliationPage';
import { getDashboardRouteForRoles } from './utils/roleRouting';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Route guard that requires an active authentication session.
 * If unauthenticated, redirects to the /login Google auth screen.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Role-aware root router:
 * Evaluates the user's role and navigates to their specific operational dashboard:
 * - Admin -> /admin/users
 * - Operations Manager -> /ops/manager
 * - Operations Executive -> /kitchen
 * - Management -> /reconciliation
 * - Delivery Team -> /dispatch
 */
const RoleAwareIndex: React.FC = () => {
  const { user } = useAuthStore();
  const destination = getDashboardRouteForRoles(user?.role);
  return <Navigate to={destination} replace />;
};

export const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Admin Domain Routes (Stitch User Management & Roles) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/users" replace />}
            />

            {/* Operations Hub (Cloud Kitchen Prep, Orders, Inventory, Dispatch) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleAwareIndex />} />
              <Route path="ops/manager" element={<OperationsManagerDashboard />} />
              <Route path="ops" element={<OperationsOverview />} />
              <Route path="customers" element={<CustomerManagementPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="kitchen" element={<KitchenDashboardPage />} />
              <Route path="inventory" element={<InventoryManagementPage />} />
              <Route path="dispatch" element={<DispatchManagementPage />} />
              <Route path="reconciliation" element={<ReconciliationPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
