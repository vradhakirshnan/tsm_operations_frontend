export type DeliveryPartner = 'direct_fleet' | 'swiggy' | 'zomato' | 'dunzo' | 'shadowfax';

export type DispatchStatus = 'packing_pending' | 'ready_for_pickup' | 'rider_assigned' | 'rider_arrived' | 'handed_over' | 'in_transit' | 'delivered';

export interface DispatchAssignment {
  dispatch_id: string; // "DSP-9041"
  order_id: string;
  customer_name: string;
  delivery_address: string;
  partner: DeliveryPartner;
  partner_order_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_vehicle_no?: string;
  estimated_pickup_time?: string;
  bag_count: number;
  seal_barcode?: string;
  otp_code?: string;
  status: DispatchStatus;
  ready_at: string;
  handover_at?: string;
  dispatch_executive?: string;
}

export interface HandoverLogEntry {
  log_id: string;
  dispatch_id: string;
  order_id: string;
  partner: DeliveryPartner;
  rider_name: string;
  rider_phone: string;
  handover_time: string;
  dispatcher_name: string;
  verified_via_otp: boolean;
  tamper_seal_checked: boolean;
  notes?: string;
}
