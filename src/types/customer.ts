export interface CityPincode {
  pincode_id: number;
  pincode: string;
  city: string;
}

export interface CustomerAddress {
  address_id: number;
  customer_id: number;
  pincode_id: number;
  address_line: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formatted_address?: string | null;
  is_default: boolean;
  pincode_details?: CityPincode;
}

export interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  created_at?: string;
  addresses?: CustomerAddress[];
}

export interface CreateCustomerDTO {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface CreateAddressDTO {
  customer_id: number;
  pincode: string;
  city: string;
  address_line: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  is_default?: boolean;
}
