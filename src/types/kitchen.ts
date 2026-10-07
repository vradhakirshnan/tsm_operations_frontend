import { ItemMaster, MenuMaster, PackageMaster } from './catalog';

export type KitchenIndentStatus = 'draft' | 'approved' | 'cancelled' | 'processed';

export interface KitchenIndentDetail {
  detail_id: number;
  indent_id: number;
  menu_id: number;
  qty: number;
  menu?: MenuMaster;
}

export interface KitchenOrder {
  kitchen_order_id: number;
  indent_id: number;
  item_id: number;
  detail_id: number;
  menu_id: number;
  quantity: number;
  indent_quantity: number;
  special_instructions?: string | null;
  station?: 'curry' | 'tandoor' | 'biryani' | 'fry' | 'assembly';
  status?: 'queued' | 'in_prep' | 'qc_passed' | 'ready_to_pack';
  item?: ItemMaster;
  menu?: MenuMaster;
  batch_number?: string;
  target_completion_time?: string;
}

export interface PackageIndent {
  package_indent_id: number;
  kitchen_order_id: number;
  item_id: number;
  package_id: number;
  quantity: number;
  banana_lining_details?: string | null;
  package?: PackageMaster;
  item?: ItemMaster;
}

export interface KitchenIndent {
  indent_id: number;
  status: KitchenIndentStatus;
  file_path?: string | null;
  created_at?: string;
  created_by?: number;
  details?: KitchenIndentDetail[];
  orders?: KitchenOrder[];
  package_indents?: PackageIndent[];
  total_orders_consolidated?: number;
}

export interface PreparedItemReceipt {
  receipt_id: number;
  kitchen_order_id: number;
  indent_id: number;
  item_name: string;
  expected_qty: number;
  received_qty: number;
  uom: string;
  variance: number;
  temperature_celsius?: number;
  chef_name: string;
  qc_supervisor: string;
  status: 'accepted' | 'partial' | 'rejected';
  received_at: string;
  notes?: string;
}

export interface PackingRequirement {
  package_id: number;
  package_name: string;
  total_needed: number;
  in_stock: number;
  shortage: number;
  associated_menus: string[];
}
