import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchApi } from '../../api/dispatchApi';
import { DispatchAssignment, DeliveryPartner, DispatchStatus } from '../../types';
import { PartnerAssignmentView } from './PartnerAssignmentView';
import { HandoverLogView } from './HandoverLogView';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useUIStore } from '../../store/uiStore';
import { Bike, ShieldCheck, KeyRound } from 'lucide-react';

export const DispatchManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'logs'>('queue');
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [handoverTarget, setHandoverTarget] = useState<DispatchAssignment | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [sealChecked, setSealChecked] = useState(true);
  const [dispatcherName, setDispatcherName] = useState('Akash Gupta');
  const [handoverNotes, setHandoverNotes] = useState('Thermal insulated bag verified.');

  const { data: queue = [] } = useQuery({
    queryKey: ['dispatch_queue'],
    queryFn: () => dispatchApi.getDispatchQueue(),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['handover_logs'],
    queryFn: () => dispatchApi.getHandoverLogs(),
  });

  const assignPartnerMutation = useMutation({
    mutationFn: ({
      dispatchId,
      partner,
      riderInfo,
    }: {
      dispatchId: string;
      partner: DeliveryPartner;
      riderInfo?: { rider_name: string; rider_phone: string; rider_vehicle_no?: string };
    }) => dispatchApi.assignPartner(dispatchId, partner, riderInfo),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['dispatch_queue'] });
      addToast({
        type: 'info',
        title: 'Rider Assigned',
        message: `${updated.rider_name || 'Rider'} allocated to ${updated.order_id}.`,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ dispatchId, status }: { dispatchId: string; status: DispatchStatus }) =>
      dispatchApi.updateDispatchStatus(dispatchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch_queue'] });
    },
  });

  const performHandoverMutation = useMutation({
    mutationFn: ({
      dispatchId,
      verification,
    }: {
      dispatchId: string;
      verification: {
        otp: string;
        sealChecked: boolean;
        dispatcherName: string;
        notes?: string;
      };
    }) => dispatchApi.performHandover(dispatchId, verification),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['dispatch_queue'] });
      queryClient.invalidateQueries({ queryKey: ['handover_logs'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({
        type: 'success',
        title: 'Handover Completed',
        message: `Order ${entry.order_id} handed over to rider ${entry.rider_name}.`,
      });
      setHandoverTarget(null);
    },
  });

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverTarget) return;

    performHandoverMutation.mutate({
      dispatchId: handoverTarget.dispatch_id,
      verification: {
        otp: otpInput || handoverTarget.otp_code || '1234',
        sealChecked,
        dispatcherName,
        notes: handoverNotes,
      },
    });
  };

  const tabs = [
    {
      id: 'queue',
      label: 'Live Dispatch Queue',
      count: queue.length,
      icon: <Bike className="h-4 w-4" />,
    },
    {
      id: 'logs',
      label: 'Handover Audit Logs',
      count: logs.length,
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Dispatch Details & Handover Tracking</h2>
        <p className="text-xs text-slate-400 mt-1">
          Coordinate delivery rider arrivals, track bag seal barcodes, verify OTPs, and maintain tamper logs.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      {activeTab === 'queue' && (
        <PartnerAssignmentView
          queue={queue}
          onAssignPartner={(dispatchId, partner, riderInfo) =>
            assignPartnerMutation.mutate({ dispatchId, partner, riderInfo })
          }
          onUpdateStatus={(dispatchId, status) =>
            updateStatusMutation.mutate({ dispatchId, status })
          }
          onInitiateHandover={(item) => {
            setHandoverTarget(item);
            setOtpInput(item.otp_code || '');
          }}
        />
      )}

      {activeTab === 'logs' && <HandoverLogView logs={logs} />}

      {/* Handover Verification Modal */}
      {handoverTarget && (
        <Modal
          isOpen={!!handoverTarget}
          onClose={() => setHandoverTarget(null)}
          title="Verify Delivery Handover"
          subtitle={`Order ${handoverTarget.order_id} • Rider: ${handoverTarget.rider_name || 'Assigned Courier'}`}
          maxWidth="md"
        >
          <form onSubmit={handleHandoverSubmit} className="space-y-4">
            <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-slate-200">{handoverTarget.customer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Partner Channel:</span>
                <span className="uppercase font-mono text-brand-400 font-bold">
                  {handoverTarget.partner}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Number of Bags:</span>
                <span className="font-semibold text-white">{handoverTarget.bag_count} Sealed Bags</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                4-Digit Rider Handover OTP <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 4829"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 font-mono tracking-widest focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Dispatch Executive Name</label>
              <input
                type="text"
                required
                value={dispatcherName}
                onChange={(e) => setDispatcherName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="sealCheckbox"
                checked={sealChecked}
                onChange={(e) => setSealChecked(e.target.checked)}
                className="rounded bg-slate-800 border-slate-750 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="sealCheckbox" className="text-xs text-slate-200">
                Tamper-evident barcode seal inspected and verified intact
              </label>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Handover Notes</label>
              <input
                type="text"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setHandoverTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<ShieldCheck className="h-4 w-4" />}>
                Authorize Rider Handover
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
