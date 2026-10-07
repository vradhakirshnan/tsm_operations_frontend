import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Order, CreateOrderDTO, OrderStatus } from '../types';
import { mockOrders, mockCustomers, mockMenus } from './mockData';

let ordersStore: Order[] = [...mockOrders];

export const ordersApi = {
  async getOrders(params?: { skip?: number; limit?: number; status?: string }): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.LIST, { params });
      return response.data;
    } catch {
      let filtered = [...ordersStore];
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((o) => o.status === params.status);
      }
      return filtered;
    }
  },

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(API_ENDPOINTS.ORDERS.GET_ONE(orderId));
      return response.data;
    } catch {
      const found = ordersStore.find((o) => o.order_id === orderId);
      if (!found) throw new Error(`Order ${orderId} not found`);
      return found;
    }
  },

  async createOrder(dto: CreateOrderDTO): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, dto);
      return response.data;
    } catch {
      const customer = mockCustomers.find((c) => c.customer_id === dto.customer_id);
      const address = customer?.addresses?.find((a) => a.address_id === dto.address_id);

      const items = dto.items.map((it, idx) => {
        const menu = mockMenus.find((m) => m.menu_id === it.menu_id);
        return {
          item_log_id: Date.now() + idx,
          order_id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          menu_id: it.menu_id,
          quantity: it.quantity,
          status: 'ordered',
          unit_price: menu?.price || 299,
          menu,
          special_instructions: it.special_instructions,
        };
      });

      const totalAmount = items.reduce((sum, it) => sum + (it.unit_price || 0) * it.quantity, 0);

      const newOrder: Order = {
        order_id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_id: dto.customer_id,
        address_id: dto.address_id,
        order_timestamp: new Date().toISOString(),
        status: 'ordered',
        indent_flag: false,
        total_amount: totalAmount,
        payment_method: dto.payment_method || 'prepaid',
        source_channel: dto.source_channel || 'direct',
        customer,
        address,
        items,
        created_at: new Date().toISOString(),
      };

      ordersStore.unshift(newOrder);
      return newOrder;
    }
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = ordersStore.find((o) => o.order_id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.status = newStatus;
    return { ...order };
  },
};
