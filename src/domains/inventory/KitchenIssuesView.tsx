import React, { useState } from 'react';
import { KitchenIssue } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus } from 'lucide-react';

interface KitchenIssuesViewProps {
  issues: KitchenIssue[];
  onCreateIssue: (dto: Omit<KitchenIssue, 'issue_id' | 'issued_at'>) => void;
}

export const KitchenIssuesView: React.FC<KitchenIssuesViewProps> = ({
  issues,
  onCreateIssue,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [station, setStation] = useState('Curry Station Pod');
  const [requestedBy, setRequestedBy] = useState('Chef Rajesh');
  const [issuedBy, setIssuedBy] = useState('Kiran Patel (Store In-charge)');
  const [itemName, setItemName] = useState('Marinated Boneless Chicken');
  const [quantity, setQuantity] = useState<number>(10);
  const [uom, setUom] = useState('kg');
  const [batchAllocated, setBatchAllocated] = useState('BAT-CHK-0710');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateIssue({
      station,
      requested_by: requestedBy,
      issued_by: issuedBy,
      status: 'issued',
      items: [
        {
          item_id: 1,
          item_name: itemName,
          quantity,
          uom,
          batch_allocated: batchAllocated,
        },
      ],
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Raw Material Stock Issues to Kitchen Floor
          </h4>
          <p className="text-xs text-slate-400">
            Deducts raw materials from central store and allocates batches to line stations for production runs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Issue Raw Material to Kitchen
        </Button>
      </div>

      {/* Issues Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Issue Slip #</th>
                <th className="py-3.5">Kitchen Station</th>
                <th className="py-3.5">Requisitioned By</th>
                <th className="py-3.5">Items Issued</th>
                <th className="py-3.5">Timestamp</th>
                <th className="py-3.5 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {issues.map((iss) => (
                <tr key={iss.issue_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                    {iss.issue_id}
                  </td>
                  <td className="py-3 font-semibold text-slate-200">{iss.station}</td>
                  <td className="py-3 text-slate-300">
                    <div>{iss.requested_by}</div>
                    <div className="text-[11px] text-slate-400">Store: {iss.issued_by}</div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      {iss.items.map((it, idx) => (
                        <div key={idx} className="text-slate-200 font-medium">
                          {it.quantity} {it.uom} {it.item_name}
                          <span className="text-[11px] text-slate-400 ml-2 font-mono">
                            [{it.batch_allocated}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">
                    {new Date(iss.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Badge variant="success" size="sm">
                      {iss.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Stock to Kitchen Station"
        subtitle="Raw ingredient handover against indent"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Station Pod</label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="Curry Station Pod">Curry Station Pod</option>
                <option value="Biryani Station Pod">Biryani Station Pod</option>
                <option value="Tandoor Station Pod">Tandoor Station Pod</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Chef In-Charge</label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Store Executive</label>
            <input
              type="text"
              required
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Item to Issue</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">UoM</label>
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Batch Code</label>
              <input
                type="text"
                required
                value={batchAllocated}
                onChange={(e) => setBatchAllocated(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Kitchen Handover
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
