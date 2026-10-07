import React, { useState } from 'react';
import { PackingIssue } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus } from 'lucide-react';

interface PackingIssuesViewProps {
  issues: PackingIssue[];
  onCreateIssue: (dto: Omit<PackingIssue, 'issue_id' | 'issued_at'>) => void;
}

export const PackingIssuesView: React.FC<PackingIssuesViewProps> = ({
  issues,
  onCreateIssue,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [station, setStation] = useState('Central Dispatch Packing Line 1');
  const [issuedTo, setIssuedTo] = useState('Naveen Kumar');
  const [issuedBy, setIssuedBy] = useState('Kiran Patel (Store In-charge)');
  const [packageName, setPackageName] = useState('750ml Round PP Container & Lid');
  const [quantity, setQuantity] = useState<number>(200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateIssue({
      station,
      issued_to: issuedTo,
      issued_by: issuedBy,
      items: [
        {
          package_id: 1,
          package_name: packageName,
          quantity,
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
            Packaging Supplies Issued to Packing Stations
          </h4>
          <p className="text-xs text-slate-400">
            Issues containers, cutlery packets, banana leaf liners, and tamper-evident carry bags to dispatch staging lines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Issue Packaging Stock
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Slip #</th>
                <th className="py-3.5">Packing Table / Line</th>
                <th className="py-3.5">Received By (Packer)</th>
                <th className="py-3.5">Supplies Handed Over</th>
                <th className="py-3.5 pr-4 text-right">Timestamp</th>
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
                    <div>{iss.issued_to}</div>
                    <div className="text-[11px] text-slate-400">Store: {iss.issued_by}</div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      {iss.items.map((it, idx) => (
                        <div key={idx} className="text-slate-200 font-medium">
                          <strong>{it.quantity} Units</strong> of {it.package_name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400 font-mono">
                    {new Date(iss.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        title="Issue Packaging Supplies"
        subtitle="Transfer containers and bags to packing line"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Packing Station Line</label>
            <input
              type="text"
              required
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Packer Executive</label>
              <input
                type="text"
                required
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
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
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Packaging Item</label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
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
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Dispatch Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
