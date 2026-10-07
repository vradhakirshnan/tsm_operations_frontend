import {
  InventoryItemStock,
  PurchaseReceipt,
  KitchenIssue,
  PackingIssue,
  StockWriteOff,
} from '../types';
import {
  mockInventoryStock,
  mockPurchaseReceipts,
  mockKitchenIssues,
  mockPackingIssues,
  mockStockWriteOffs,
} from './mockData';

let inventoryStore: InventoryItemStock[] = [...mockInventoryStock];
let purchaseReceiptsStore: PurchaseReceipt[] = [...mockPurchaseReceipts];
let kitchenIssuesStore: KitchenIssue[] = [...mockKitchenIssues];
let packingIssuesStore: PackingIssue[] = [...mockPackingIssues];
let writeOffsStore: StockWriteOff[] = [...mockStockWriteOffs];

export const inventoryApi = {
  async getStockOverview(): Promise<InventoryItemStock[]> {
    return [...inventoryStore];
  },

  async getPurchaseReceipts(): Promise<PurchaseReceipt[]> {
    return [...purchaseReceiptsStore];
  },

  async recordPurchaseReceipt(dto: Omit<PurchaseReceipt, 'receipt_id'>): Promise<PurchaseReceipt> {
    const newReceipt: PurchaseReceipt = {
      receipt_id: `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...dto,
    };
    purchaseReceiptsStore.unshift(newReceipt);

    // Update stock levels
    dto.items.forEach((item) => {
      const stock = inventoryStore.find((s) => s.reference_id === item.item_id);
      if (stock) {
        stock.current_stock += item.received_qty;
        stock.last_updated = new Date().toISOString();
      }
    });

    return newReceipt;
  },

  async getKitchenIssues(): Promise<KitchenIssue[]> {
    return [...kitchenIssuesStore];
  },

  async createKitchenIssue(dto: Omit<KitchenIssue, 'issue_id' | 'issued_at'>): Promise<KitchenIssue> {
    const newIssue: KitchenIssue = {
      issue_id: `ISSUE-K-${Math.floor(900 + Math.random() * 100)}`,
      issued_at: new Date().toISOString(),
      ...dto,
    };
    kitchenIssuesStore.unshift(newIssue);

    // Deduct from stock
    dto.items.forEach((it) => {
      const stock = inventoryStore.find((s) => s.reference_id === it.item_id);
      if (stock) {
        stock.current_stock = Math.max(0, stock.current_stock - it.quantity);
        stock.last_updated = new Date().toISOString();
      }
    });

    return newIssue;
  },

  async getPackingIssues(): Promise<PackingIssue[]> {
    return [...packingIssuesStore];
  },

  async createPackingIssue(dto: Omit<PackingIssue, 'issue_id' | 'issued_at'>): Promise<PackingIssue> {
    const newIssue: PackingIssue = {
      issue_id: `ISSUE-P-${Math.floor(400 + Math.random() * 100)}`,
      issued_at: new Date().toISOString(),
      ...dto,
    };
    packingIssuesStore.unshift(newIssue);

    // Deduct packaging from stock
    dto.items.forEach((it) => {
      const stock = inventoryStore.find((s) => s.reference_id === it.package_id && s.reference_type === 'package');
      if (stock) {
        stock.current_stock = Math.max(0, stock.current_stock - it.quantity);
        stock.last_updated = new Date().toISOString();
      }
    });

    return newIssue;
  },

  async getStockWriteOffs(): Promise<StockWriteOff[]> {
    return [...writeOffsStore];
  },

  async recordStockWriteOff(dto: Omit<StockWriteOff, 'write_off_id' | 'timestamp'>): Promise<StockWriteOff> {
    const newWriteOff: StockWriteOff = {
      write_off_id: `WRO-2026-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...dto,
    };
    writeOffsStore.unshift(newWriteOff);

    // Deduct written-off quantity from inventory
    const stock = inventoryStore.find((s) => s.reference_id === dto.reference_id);
    if (stock) {
      stock.current_stock = Math.max(0, stock.current_stock - dto.quantity);
      stock.last_updated = new Date().toISOString();
    }

    return newWriteOff;
  },
};
