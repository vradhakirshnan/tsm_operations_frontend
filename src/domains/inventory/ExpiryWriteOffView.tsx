import React, { useState } from 'react';
import { StockWriteOff } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Trash2, ShieldAlert } from 'lucide-react';

interface ExpiryWriteOffViewProps {
  writeOffs: StockWriteOff[];
  onRecordWriteOff: (dto: Omit<StockWriteOff, 'write_off_id' | 'timestamp'>) => void;
}

export const ExpiryWriteOffView: React.FC<ExpiryWriteOffViewProps> = ({
  writeOffs,
  onRecordWriteOff,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('Fresh Malai Paneer Cubes');
  const [quantity, setQuantity] = useState<number>(2.0);
  const [uom, setUom] = useState('kg');
  const [batchNumber, setBatchNumber] = useState('BAT-PAN-0510');
  const [reason, setReason] = useState<StockWriteOff['reason']>('expired');
  const [reportedBy, setReportedBy] = useState('Chef Rajesh');
  const [approvedBy, setApprovedBy] = useState('Operations Manager Sunil');
  const [financialLoss, setFinancialLoss] = useState<number>(720);
  const [notes, setNotes] = useState('Expired past standard 48-hr shelf life.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordWriteOff({
      reference_type: 'item',
      reference_id: 4,
      name,
      quantity,
      uom,
      batch_number: batchNumber,
      reason,
      reported_by: reportedBy,
      approved_by: approvedBy,
      financial_loss: financialLoss,
      notes,
    });
    setIsModalOpen(false);
  };

  const totalFinancialLoss = writeOffs.reduce((sum, w) => sum + w.financial_loss, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner with Financial Loss KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-white">
              Expiry, Spoilage & Write-Off Ledger
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory wastage tracking and supervisor sign-offs for food safety compliance. Cumulative loss:{' '}
            <strong className="text-rose-400 font-mono">₹{totalFinancialLoss}</strong>
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Trash2 className="h-4 w-4" />}
        >
          Record Stock Write-Off
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Write-Off ID</th>
                <th className="py-3.5">Item Name</th>
                <th className="py-3.5">Quantity & Batch</th>
                <th className="py-3.5">Wastage Reason</th>
                <th className="py-3.5">Financial Loss</th>
                <th className="py-3.5">Sign-off Approvals</th>
                <th className="py-3.5 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {writeOffs.map((w) => (
                <tr key={w.write_off_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-rose-400">
                    {w.write_off_id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-100">{w.name}</div>
                    {w.notes && <div className="text-[11px] text-slate-400 mt-0.5">{w.notes}</div>}
                  </td>
                  <td className="py-3 font-mono text-slate-200">
                    <strong>{w.quantity} {w.uom}</strong>
                    {w.batch_number && (
                      <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                        [{w.batch_number}]
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge variant="danger" size="sm">
                      {w.reason.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 font-mono font-bold text-rose-400">
                    ₹{w.financial_loss}
                  </td>
                  <td className="py-3 text-slate-300">
                    <div>Rep: {w.reported_by}</div>
                    <div className="text-[11px] text-emerald-400">Approved: {w.approved_by}</div>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400 font-mono">
                    {new Date(w.timestamp).toLocaleDateString()}
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
        title="Record Inventory Write-Off"
        subtitle="Log spoiled, damaged or expired stock with loss amount"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Item to Write Off</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                step="0.1"
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
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Wastage Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as StockWriteOff['reason'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="expired">Date Expired</option>
                <option value="spoilage">Cold Chain Spoilage</option>
                <option value="burnt_in_prep">Burnt in Kitchen Prep</option>
                <option value="damaged">Damaged Outer Packing</option>
                <option value="audit_discrepancy">Physical Audit Variance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Financial Loss (₹)</label>
              <input
                type="number"
                required
                value={financialLoss}
                onChange={(e) => setFinancialLoss(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reported By</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Authorizing Supervisor</label>
              <input
                type="text"
                required
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Investigation Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm & Write Off Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
