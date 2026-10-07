import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/ordersApi';
import { customerApi } from '../../api/customerApi';
import { catalogApi } from '../../api/catalogApi';
import { Order, OrderStatus, CreateOrderDTO } from '../../types';
import { OrderListView } from './OrderListView';
import { OrderEntryForm } from './OrderEntryForm';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { Tabs } from '../../components/common/Tabs';
import { useUIStore } from '../../store/uiStore';
import { ShoppingBag, PlusCircle } from 'lucide-react';

export const OrderManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const state = location.state as {
    preselectedCustomerId?: number;
    preselectedAddressId?: number;
  } | null;

  const [activeTab, setActiveTab] = useState<'list' | 'create'>(
    state?.preselectedCustomerId ? 'create' : 'list'
  );

  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers(),
  });

  const { data: menus = [] } = useQuery({
    queryKey: ['catalog_menus'],
    queryFn: () => catalogApi.getMenus(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (dto: CreateOrderDTO) => ordersApi.createOrder(dto),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({
        type: 'success',
        title: 'Order Created',
        message: `Order ${newOrder.order_id} recorded and queued for kitchen indent.`,
      });
      setActiveTab('list');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (inspectedOrder && inspectedOrder.order_id === updated.order_id) {
        setInspectedOrder(updated);
      }
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `Order ${updated.order_id} moved to ${updated.status}.`,
      });
    },
  });

  const tabs = [
    {
      id: 'list',
      label: 'Live Orders Stream',
      count: orders.length,
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      id: 'create',
      label: 'Order Entry Form',
      icon: <PlusCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Order Capture & Tracking</h2>
        <p className="text-xs text-slate-400 mt-1">
          Internal order ingestion console for cloud kitchen operations executives, phone attendants, and customer service.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      {activeTab === 'list' && (
        <OrderListView
          orders={orders}
          onSelectOrder={(ord) => setInspectedOrder(ord)}
          onQuickStatusChange={(orderId, status) =>
            updateStatusMutation.mutate({ orderId, status })
          }
        />
      )}

      {activeTab === 'create' && (
        <OrderEntryForm
          customers={customers}
          menus={menus}
          initialCustomerId={state?.preselectedCustomerId}
          initialAddressId={state?.preselectedAddressId}
          onOrderCreated={(dto) => createOrderMutation.mutate(dto)}
          onNavigateToCustomer={() => navigate('/customers')}
        />
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={inspectedOrder}
        isOpen={!!inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        onUpdateStatus={(orderId, status) =>
          updateStatusMutation.mutate({ orderId, status })
        }
      />
    </div>
  );
};
