import React, { useState } from 'react';
import { DispatchAssignment, DeliveryPartner, DispatchStatus } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Bike,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PartnerAssignmentViewProps {
  queue: DispatchAssignment[];
  onAssignPartner: (
    dispatchId: string,
    partner: DeliveryPartner,
    riderInfo?: { rider_name: string; rider_phone: string; rider_vehicle_no?: string }
  ) => void;
  onUpdateStatus: (dispatchId: string, status: DispatchStatus) => void;
  onInitiateHandover: (assignment: DispatchAssignment) => void;
}

export const PartnerAssignmentView: React.FC<PartnerAssignmentViewProps> = ({
  queue,
  onAssignPartner,
  onUpdateStatus,
  onInitiateHandover,
}) => {
  const [assignModalItem, setAssignModalItem] = useState<DispatchAssignment | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner>('swiggy');
  const [riderName, setRiderName] = useState('Deepak Verma');
  const [riderPhone, setRiderPhone] = useState('+919811223344');
  const [riderVehicle, setRiderVehicle] = useState('KA-03-HA-4412');

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalItem) return;

    onAssignPartner(assignModalItem.dispatch_id, selectedPartner, {
      rider_name: riderName,
      rider_phone: riderPhone,
      rider_vehicle_no: riderVehicle,
    });
    setAssignModalItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Dispatch Queue & Delivery Partner Assignment
          </h4>
          <p className="text-xs text-slate-400">
            Allocate internal fleet or external aggregators (Swiggy, Zomato, Dunzo), assign riders, and record dispatch handovers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Badge variant="brand" size="md">
            {queue.filter((q) => q.status !== 'handed_over' && q.status !== 'delivered').length} Active Handover Tasks
          </Badge>
        </div>
      </div>

      {/* Dispatch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map((item) => {
          const isHandedOver = item.status === 'handed_over' || item.status === 'delivered';
          return (
            <div
              key={item.dispatch_id}
              className="bg-slate-850 border border-slate-800 rounded-xl p-5 hover:border-slate-750 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-brand-400">
                      {item.order_id}
                    </span>
                    <h5 className="font-bold text-white text-sm mt-0.5">{item.customer_name}</h5>
                  </div>
                  <Badge
                    variant={
                      item.status === 'handed_over'
                        ? 'neutral'
                        : item.status === 'rider_arrived'
                        ? 'success'
                        : item.status === 'rider_assigned'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                    dot
                  >
                    {item.status.toUpperCase().replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  📍 {item.delivery_address}
                </p>

                {/* Partner and Rider details */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Partner:</span>
                    <span className="uppercase font-bold text-slate-200 font-mono">
                      {item.partner.replace('_', ' ')}
                    </span>
                  </div>

                  {item.rider_name ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rider:</span>
                        <span className="font-semibold text-slate-200">{item.rider_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{item.rider_phone}</span>
                        <span>{item.rider_vehicle_no}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-amber-400 italic">No rider assigned yet</div>
                  )}

                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Bags: {item.bag_count}</span>
                    {item.otp_code && (
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        OTP: {item.otp_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {!isHandedOver ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAssignModalItem(item);
                        setSelectedPartner(item.partner);
                      }}
                      icon={<Bike className="h-3.5 w-3.5" />}
                    >
                      Assign Rider
                    </Button>

                    {item.status === 'rider_assigned' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateStatus(item.dispatch_id, 'rider_arrived')}
                      >
                        Arrived
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onInitiateHandover(item)}
                      icon={<ShieldCheck className="h-3.5 w-3.5" />}
                    >
                      Verify Handover
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Dispatched at {new Date(item.handover_at || Date.now()).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Partner Modal */}
      {assignModalItem && (
        <Modal
          isOpen={!!assignModalItem}
          onClose={() => setAssignModalItem(null)}
          title="Assign Delivery Partner & Rider"
          subtitle={`Order ${assignModalItem.order_id} - ${assignModalItem.customer_name}`}
          maxWidth="md"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Delivery Channel Partner</label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value as DeliveryPartner)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase font-semibold"
              >
                <option value="direct_fleet">Direct Kitchen Fleet (Own Riders)</option>
                <option value="swiggy">Swiggy Integrated</option>
                <option value="zomato">Zomato Integrated</option>
                <option value="dunzo">Dunzo Courier</option>
                <option value="shadowfax">Shadowfax Hyperlocal</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rider Phone</label>
                <input
                  type="tel"
                  required
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Vehicle License No.</label>
              <input
                type="text"
                value={riderVehicle}
                onChange={(e) => setRiderVehicle(e.target.value)}
                placeholder="e.g. KA-01-EQ-9182"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setAssignModalItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Rider Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
