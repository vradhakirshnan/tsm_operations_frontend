import React, { useState } from 'react';
import { Customer, CustomerAddress } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Phone,
  Mail,
  MapPin,
  Plus,
  Navigation,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onAddAddress: (customer: Customer) => void;
  onSelectForOrder?: (customer: Customer, address?: CustomerAddress) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onAddAddress,
  onSelectForOrder,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    customers[0]?.customer_id || null
  );

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer Directory List */}
      <div className="lg:col-span-1 bg-slate-850 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[650px]">
        <div className="p-4 border-b border-slate-800 bg-slate-850/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Directory ({customers.length})
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {customers.map((c) => {
            const isSelected = c.customer_id === selectedCustomerId;
            const addressCount = c.addresses?.length || 0;

            return (
              <div
                key={c.customer_id}
                onClick={() => setSelectedCustomerId(c.customer_id)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-brand-500/10 border-l-4 border-brand-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-100 text-sm">{c.name}</h4>
                  <Badge variant={addressCount > 0 ? 'success' : 'default'} size="sm">
                    {addressCount} {addressCount === 1 ? 'Addr' : 'Addrs'}
                  </Badge>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Detail & Address Map Coordinates Card */}
      <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-800 p-6 flex flex-col h-[650px] overflow-y-auto">
        {selectedCustomer ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="font-mono text-brand-400">{selectedCustomer.phone}</span>
                  {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAddAddress(selectedCustomer)}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add GPS Address
                </Button>
                {onSelectForOrder && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectForOrder(selectedCustomer, selectedCustomer.addresses?.[0])}
                    icon={<ShoppingBag className="h-4 w-4" />}
                  >
                    Create Order
                  </Button>
                )}
              </div>
            </div>

            {/* Notes if present */}
            {selectedCustomer.notes && (
              <div className="bg-slate-800/40 border border-slate-750 p-3 rounded-lg text-xs text-slate-300">
                <span className="font-semibold text-slate-200 block mb-0.5">Kitchen / Operational Notes:</span>
                {selectedCustomer.notes}
              </div>
            )}

            {/* Address List with GPS Coordinates & OSM Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-400" />
                Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
              </h4>

              {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                  <Navigation className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No delivery address saved yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onAddAddress(selectedCustomer)}
                  >
                    Pin First Address on Map
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCustomer.addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-750 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-semibold text-slate-200">
                              {addr.address_line}
                            </h5>
                            {addr.is_default && (
                              <Badge variant="brand" size="sm">
                                Default
                              </Badge>
                            )}
                          </div>
                          {addr.landmark && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Landmark: <span className="text-slate-300">{addr.landmark}</span>
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">
                            City & Pincode:{' '}
                            <span className="text-slate-300">
                              {addr.pincode_details?.city || 'Bengaluru'} - {addr.pincode_details?.pincode}
                            </span>
                          </p>
                        </div>

                        {onSelectForOrder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectForOrder(selectedCustomer, addr)}
                          >
                            Use For Order
                          </Button>
                        )}
                      </div>

                      {/* GPS Coordinate Badge & OpenStreetMap Anchor */}
                      {addr.latitude && addr.longitude && (
                        <div className="flex items-center justify-between p-2.5 bg-slate-850 rounded-lg border border-slate-750 text-xs">
                          <div className="flex items-center gap-2 font-mono text-slate-300">
                            <Navigation className="h-3.5 w-3.5 text-brand-400" />
                            <span>
                              Lat: <strong className="text-white">{addr.latitude}</strong>, Lng:{' '}
                              <strong className="text-white">{addr.longitude}</strong>
                            </span>
                          </div>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-medium"
                          >
                            <span>Open Navigation</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <MapPin className="h-8 w-8 mb-2" />
            <p className="text-xs">Select a customer from the left directory to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
