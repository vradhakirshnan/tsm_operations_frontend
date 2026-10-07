import React, { useState } from 'react';
import { Customer, MenuMaster, CreateOrderDTO, CreateOrderItemDTO } from '../../types';
import { Button } from '../../components/common/Button';
import {
  User,
  MapPin,
  ShoppingBag,
  Plus,
  Trash2,
  Navigation,
} from 'lucide-react';

interface OrderEntryFormProps {
  customers: Customer[];
  menus: MenuMaster[];
  initialCustomerId?: number;
  initialAddressId?: number;
  onOrderCreated: (dto: CreateOrderDTO) => void;
  onNavigateToCustomer: () => void;
}

export const OrderEntryForm: React.FC<OrderEntryFormProps> = ({
  customers,
  menus,
  initialCustomerId,
  initialAddressId,
  onOrderCreated,
  onNavigateToCustomer,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    initialCustomerId || customers[0]?.customer_id || 1
  );

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId);

  const [selectedAddressId, setSelectedAddressId] = useState<number>(
    initialAddressId || selectedCustomer?.addresses?.[0]?.address_id || 0
  );

  const [channel, setChannel] = useState<'direct' | 'phone'>('direct');
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod' | 'upi'>('upi');

  const [itemsList, setItemsList] = useState<CreateOrderItemDTO[]>([
    { menu_id: menus[0]?.menu_id || 1, quantity: 1, special_instructions: '' },
  ]);

  const handleAddItemRow = () => {
    setItemsList((prev) => [
      ...prev,
      { menu_id: menus[0]?.menu_id || 1, quantity: 1, special_instructions: '' },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItemsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItemRow = (
    idx: number,
    field: keyof CreateOrderItemDTO,
    val: unknown
  ) => {
    setItemsList((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    );
  };

  const selectedAddress = selectedCustomer?.addresses?.find(
    (a) => a.address_id === selectedAddressId
  ) || selectedCustomer?.addresses?.[0];

  // Calculate order total
  const totalAmount = itemsList.reduce((sum, item) => {
    const dish = menus.find((m) => m.menu_id === item.menu_id);
    return sum + (dish?.price || 0) * item.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer.');
      return;
    }
    if (!selectedAddress) {
      alert('Customer has no delivery address. Please add an address first.');
      return;
    }
    if (itemsList.length === 0) {
      alert('Please add at least one dish.');
      return;
    }

    onOrderCreated({
      customer_id: selectedCustomer.customer_id,
      address_id: selectedAddress.address_id,
      source_channel: channel,
      payment_method: paymentMethod,
      items: itemsList,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* 2-column Customer & Delivery selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Select */}
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-400" />
              <h4 className="text-sm font-semibold text-white">Customer Identification</h4>
            </div>
            <button
              type="button"
              onClick={onNavigateToCustomer}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1"
            >
              + Register New
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Existing Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedCustomerId(id);
                const cust = customers.find((c) => c.customer_id === id);
                if (cust?.addresses?.[0]) {
                  setSelectedAddressId(cust.addresses[0].address_id);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-slate-200">{selectedCustomer.name}</div>
              <div className="text-slate-400 font-mono">{selectedCustomer.phone}</div>
              {selectedCustomer.notes && (
                <div className="text-[11px] text-amber-400 mt-1">{selectedCustomer.notes}</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as 'direct' | 'phone')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="direct">Direct Web / Walk-in</option>
                <option value="phone">Phone / WhatsApp Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'prepaid' | 'cod' | 'upi')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="upi">UPI / Instant Online</option>
                <option value="prepaid">Prepaid Corporate Ledger</option>
                <option value="cod">Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address & GPS Target */}
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" />
              <h4 className="text-sm font-semibold text-white">Delivery Coordinates & Address</h4>
            </div>
          </div>

          {(!selectedCustomer?.addresses || selectedCustomer.addresses.length === 0) ? (
            <div className="text-center py-8 text-xs text-rose-400 space-y-2">
              <p>No address found for this customer.</p>
              <Button type="button" variant="outline" size="sm" onClick={onNavigateToCustomer}>
                Capture Address & GPS Coordinates
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Delivery Address Destination</label>
                <select
                  value={selectedAddress?.address_id}
                  onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  {selectedCustomer.addresses.map((a) => (
                    <option key={a.address_id} value={a.address_id}>
                      {a.address_line} ({a.pincode_details?.pincode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAddress && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {selectedAddress.address_line}
                  </p>
                  {selectedAddress.landmark && (
                    <p className="text-slate-400">Landmark: {selectedAddress.landmark}</p>
                  )}
                  {selectedAddress.latitude && selectedAddress.longitude && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-slate-850 px-2 py-1 rounded border border-slate-750">
                      <Navigation className="h-3 w-3" />
                      <span>
                        Lat: {selectedAddress.latitude}, Lng: {selectedAddress.longitude}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dishes / Line Items */}
      <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand-400" />
            <h4 className="text-sm font-semibold text-white">Order Line Items</h4>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddItemRow}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Dish / Combo
          </Button>
        </div>

        <div className="space-y-3">
          {itemsList.map((row, idx) => {
            const currentMenu = menus.find((m) => m.menu_id === row.menu_id);
            const lineTotal = (currentMenu?.price || 0) * row.quantity;

            return (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-3 bg-slate-900 rounded-lg border border-slate-800"
              >
                {/* Menu dish selection */}
                <div className="sm:col-span-5">
                  <label className="block text-[11px] text-slate-400 mb-1">Dish / Menu Combo</label>
                  <select
                    value={row.menu_id}
                    onChange={(e) => handleUpdateItemRow(idx, 'menu_id', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium"
                  >
                    {menus.map((m) => (
                      <option key={m.menu_id} value={m.menu_id}>
                        {m.name} - ₹{m.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Portion Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => handleUpdateItemRow(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono text-center"
                  />
                </div>

                {/* Special Instructions */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] text-slate-400 mb-1">Chef Instructions</label>
                  <input
                    type="text"
                    value={row.special_instructions || ''}
                    onChange={(e) => handleUpdateItemRow(idx, 'special_instructions', e.target.value)}
                    placeholder="e.g. Mild spice, extra onions"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                  />
                </div>

                {/* Total and Remove button */}
                <div className="sm:col-span-1 flex flex-col items-end justify-center sm:pt-4">
                  <span className="font-mono text-xs font-bold text-brand-400">₹{lineTotal}</span>
                  <button
                    type="button"
                    disabled={itemsList.length <= 1}
                    onClick={() => handleRemoveItemRow(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary & Submit */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Total Items: <strong className="text-white">{itemsList.length}</strong> | Total Payable:{' '}
            <span className="text-base font-bold text-brand-400 font-mono">₹{totalAmount}</span>
          </div>

          <Button type="submit" variant="primary" size="md" icon={<ShoppingBag className="h-4 w-4" />}>
            Confirm & Ingest Order (₹{totalAmount})
          </Button>
        </div>
      </div>
    </form>
  );
};
