import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Customer, CityPincode, CustomerAddress, CreateCustomerDTO, CreateAddressDTO } from '../types';
import { mockCustomers, mockPincodes } from './mockData';

// In-memory cache for offline/mock mode
let customersStore: Customer[] = [...mockCustomers];
let pincodesStore: CityPincode[] = [...mockPincodes];

export const customerApi = {
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(API_ENDPOINTS.CUSTOMERS.LIST);
      return response.data;
    } catch {
      return [...customersStore];
    }
  },

  async createCustomer(dto: CreateCustomerDTO): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>(API_ENDPOINTS.CUSTOMERS.CREATE, dto);
      return response.data;
    } catch {
      const newCustomer: Customer = {
        customer_id: Date.now(),
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
        created_at: new Date().toISOString(),
        addresses: [],
      };
      customersStore.unshift(newCustomer);
      return newCustomer;
    }
  },

  async getPincodes(): Promise<CityPincode[]> {
    try {
      const response = await apiClient.get<CityPincode[]>(API_ENDPOINTS.CUSTOMERS.PINCODES);
      return response.data;
    } catch {
      return [...pincodesStore];
    }
  },

  async addAddress(dto: CreateAddressDTO): Promise<CustomerAddress> {
    try {
      const response = await apiClient.post<CustomerAddress>(API_ENDPOINTS.CUSTOMERS.ADDRESSES, dto);
      return response.data;
    } catch {
      let pin = pincodesStore.find((p) => p.pincode === dto.pincode);
      if (!pin) {
        pin = {
          pincode_id: pincodesStore.length + 1,
          pincode: dto.pincode,
          city: dto.city,
        };
        pincodesStore.push(pin);
      }

      const newAddr: CustomerAddress = {
        address_id: Date.now(),
        customer_id: dto.customer_id,
        pincode_id: pin.pincode_id,
        address_line: dto.address_line,
        landmark: dto.landmark,
        latitude: dto.latitude,
        longitude: dto.longitude,
        formatted_address: dto.formatted_address || `${dto.address_line}, ${dto.city} - ${dto.pincode}`,
        is_default: dto.is_default ?? false,
        pincode_details: pin,
      };

      const customer = customersStore.find((c) => c.customer_id === dto.customer_id);
      if (customer) {
        if (!customer.addresses) customer.addresses = [];
        if (newAddr.is_default) {
          customer.addresses.forEach((a) => (a.is_default = false));
        }
        customer.addresses.push(newAddr);
      }

      return newAddr;
    }
  },
};
