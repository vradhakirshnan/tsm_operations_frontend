import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../../api/customerApi';
import { Customer, CustomerAddress, CreateCustomerDTO, CreateAddressDTO } from '../../types';
import { CustomerList } from './CustomerList';
import { CustomerFormModal } from './CustomerFormModal';
import { AddressMapCaptureModal } from './AddressMapCaptureModal';
import { Button } from '../../components/common/Button';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';

export const CustomerManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [addressModalTarget, setAddressModalTarget] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers(),
  });

  const createCustomerMutation = useMutation({
    mutationFn: (dto: CreateCustomerDTO) => customerApi.createCustomer(dto),
    onSuccess: (newCust) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      addToast({
        type: 'success',
        title: 'Customer Registered',
        message: `${newCust.name} successfully added to database.`,
      });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (dto: CreateAddressDTO) => customerApi.addAddress(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      addToast({
        type: 'success',
        title: 'Address & Coordinates Saved',
        message: 'Delivery coordinates pinned successfully.',
      });
    },
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOrderInitiation = (customer: Customer, address?: CustomerAddress) => {
    navigate('/orders', {
      state: {
        preselectedCustomerId: customer.customer_id,
        preselectedAddressId: address?.address_id,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Demographics & Geo-Mapping</h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture executive customer profiles, delivery addresses, and high-accuracy GPS coordinates for dispatch riders.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCustomerModalOpen(true)}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Add New Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-850 border border-slate-750 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading customer directory...</div>
      ) : (
        <CustomerList
          customers={filteredCustomers}
          onAddAddress={(cust) => setAddressModalTarget(cust)}
          onSelectForOrder={handleOrderInitiation}
        />
      )}

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerSaved={(dto) => createCustomerMutation.mutate(dto)}
      />

      {/* Address & Coordinates Modal */}
      {addressModalTarget && (
        <AddressMapCaptureModal
          isOpen={!!addressModalTarget}
          onClose={() => setAddressModalTarget(null)}
          customerId={addressModalTarget.customer_id}
          customerName={addressModalTarget.name}
          onAddressSaved={(dto) => addAddressMutation.mutate(dto)}
        />
      )}
    </div>
  );
};
