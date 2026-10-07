import { UOMType } from './catalog';

export type InventoryCategory = 'raw_ingredient' | 'packaging_material' | 'semi_finished' | 'consumable';

export interface InventoryItemStock {
  id: string; // "item_1" or "pkg_2"
  reference_type: 'item' | 'package';
  reference_id: number;
  name: string;
  category: InventoryCategory;
  uom: UOMType | 'nos';
  current_stock: number;
  min_reorder_level: number;
  avg_unit_cost: number;
  batch_count: number;
  last_updated: string;
}

export interface PurchaseReceipt {
  receipt_id: string; // e.g. "GRN-2026-1042"
  po_number: string;  // e.g. "PO-8841"
  vendor_name: string;
  invoice_number: string;
  receipt_date: string;
  received_by: string;
  total_amount: number;
  items: {
    receipt_item_id: number;
    item_id?: number;
    package_id?: number;
    name: string;
    ordered_qty: number;
    received_qty: number;
    unit_price: number;
    uom: string;
    batch_number: string;
    expiry_date: string;
  }[];
  status: 'fully_received' | 'partially_received' | 'rejected';
  notes?: string;
}

export interface KitchenIssue {
  issue_id: string; // "ISSUE-K-901"
  indent_id?: number;
  station: string;
  requested_by: string;
  issued_by: string;
  issued_at: string;
  items: {
    item_id: number;
    item_name: string;
    quantity: number;
    uom: string;
    batch_allocated: string;
  }[];
  status: 'issued' | 'returned' | 'cancelled';
}

export interface PackingIssue {
  issue_id: string; // "ISSUE-P-402"
  station: string; // e.g. "Packing Table A"
  issued_to: string;
  issued_by: string;
  issued_at: string;
  items: {
    package_id: number;
    package_name: string;
    quantity: number;
  }[];
}

export interface StockWriteOff {
  write_off_id: string; // "WRO-2026-041"
  reference_type: 'item' | 'package';
  reference_id: number;
  name: string;
  quantity: number;
  uom: string;
  batch_number?: string;
  reason: 'expired' | 'damaged' | 'spoilage' | 'burnt_in_prep' | 'audit_discrepancy';
  reported_by: string;
  approved_by: string;
  financial_loss: number;
  timestamp: string;
  notes?: string;
}
