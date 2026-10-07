import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  KitchenIndent,
  KitchenOrder,
  PreparedItemReceipt,
  PackingRequirement,
} from '../types';
import {
  mockKitchenIndents,
  mockKitchenOrders,
  mockPreparedReceipts,
  mockPackingRequirements,
} from './mockData';

let indentsStore: KitchenIndent[] = [...mockKitchenIndents];
let kitchenOrdersStore: KitchenOrder[] = [...mockKitchenOrders];
let preparedReceiptsStore: PreparedItemReceipt[] = [...mockPreparedReceipts];
let packingReqsStore: PackingRequirement[] = [...mockPackingRequirements];

export const kitchenApi = {
  async getIndents(): Promise<KitchenIndent[]> {
    try {
      const response = await apiClient.get<KitchenIndent[]>(API_ENDPOINTS.INDENTS.LIST);
      return response.data;
    } catch {
      return [...indentsStore];
    }
  },

  async createIndent(status: 'draft' | 'approved' = 'draft'): Promise<KitchenIndent> {
    try {
      const response = await apiClient.post<KitchenIndent>(API_ENDPOINTS.INDENTS.CREATE, { status });
      return response.data;
    } catch {
      const newIndent: KitchenIndent = {
        indent_id: indentsStore.length + 11,
        status,
        created_at: new Date().toISOString(),
        created_by: 1,
        total_orders_consolidated: 5,
        details: [],
        orders: [],
      };
      indentsStore.unshift(newIndent);
      return newIndent;
    }
  },

  async getPrepBoardOrders(): Promise<KitchenOrder[]> {
    return [...kitchenOrdersStore];
  },

  async updatePrepOrderStatus(
    kitchenOrderId: number,
    newStatus: 'queued' | 'in_prep' | 'qc_passed' | 'ready_to_pack'
  ): Promise<KitchenOrder> {
    const order = kitchenOrdersStore.find((ko) => ko.kitchen_order_id === kitchenOrderId);
    if (!order) throw new Error('Kitchen order not found');
    order.status = newStatus;
    return { ...order };
  },

  async getPreparedReceipts(): Promise<PreparedItemReceipt[]> {
    return [...preparedReceiptsStore];
  },

  async recordPreparedReceipt(
    dto: Omit<PreparedItemReceipt, 'receipt_id' | 'received_at'>
  ): Promise<PreparedItemReceipt> {
    const newReceipt: PreparedItemReceipt = {
      receipt_id: Date.now(),
      received_at: new Date().toISOString(),
      ...dto,
    };
    preparedReceiptsStore.unshift(newReceipt);
    return newReceipt;
  },

  async getPackingRequirements(): Promise<PackingRequirement[]> {
    return [...packingReqsStore];
  },
};
