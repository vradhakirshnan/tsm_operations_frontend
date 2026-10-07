import { Customer, CustomerAddress } from './customer';
import { MenuMaster } from './catalog';

export type OrderStatus = 'ordered' | 'edited' | 'kitchen_accepted' | 'cooking' | 'ready' | 'dispatched' | 'cancelled';

export interface OrderItem {
  item_log_id: number;
  order_id: string;
  menu_id: number;
  quantity: number;
  status: string;
  unit_price?: number;
  menu?: MenuMaster;
  special_instructions?: string;
}

export interface Order {
  order_id: string;
  customer_id: number;
  address_id: number;
  order_timestamp: string;
  status: OrderStatus;
  indent_flag: boolean;
  total_amount?: number;
  payment_method?: 'prepaid' | 'cod' | 'upi';
  external_order_id?: string;
  source_channel?: 'direct' | 'swiggy' | 'zomato' | 'phone';
  customer?: Customer;
  address?: CustomerAddress;
  items: OrderItem[];
  created_at?: string;
}

export interface CreateOrderItemDTO {
  menu_id: number;
  quantity: number;
  special_instructions?: string;
}

export interface CreateOrderDTO {
  customer_id: number;
  address_id: number;
  source_channel?: 'direct' | 'phone';
  payment_method?: 'prepaid' | 'cod' | 'upi';
  items: CreateOrderItemDTO[];
}
