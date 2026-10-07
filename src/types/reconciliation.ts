export type ReconciliationStatus = 'matched' | 'variance_flagged' | 'in_review' | 'resolved' | 'disputed';

export type VarianceCategory = 
  | 'commission_mismatch'
  | 'cancellation_penalty'
  | 'packaging_charge_variance'
  | 'tax_gst_rounding'
  | 'missing_in_external'
  | 'missing_in_internal'
  | 'discount_cost_split';

export interface BillingReconciliationRecord {
  reconciliation_id: string; // "REC-5021"
  order_id: string;
  source_channel: 'swiggy' | 'zomato' | 'direct_pos' | 'phone_order';
  external_reference_id?: string;
  order_date: string;
  internal_order_amount: number;
  external_billed_amount: number;
  variance_amount: number;
  variance_percent: number;
  category?: VarianceCategory;
  status: ReconciliationStatus;
  audit_notes?: string;
  reviewed_by?: string;
  resolution_action?: string;
  resolved_at?: string;
}

export interface ReconciliationSummary {
  total_orders_audited: number;
  total_internal_gmv: number;
  total_external_settled: number;
  net_variance: number;
  clean_match_rate: number;
  flagged_records_count: number;
  open_disputes_count: number;
}
