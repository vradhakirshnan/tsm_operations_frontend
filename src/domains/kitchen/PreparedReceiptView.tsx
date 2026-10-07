import React, { useState } from 'react';
import { PreparedItemReceipt } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus, Thermometer } from 'lucide-react';

interface PreparedReceiptViewProps {
  receipts: PreparedItemReceipt[];
  onRecordReceipt: (dto: Omit<PreparedItemReceipt, 'receipt_id' | 'received_at'>) => void;
}

export const PreparedReceiptView: React.FC<PreparedReceiptViewProps> = ({
  receipts,
  onRecordReceipt,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('Butter Chicken Makhani Batch');
  const [expectedQty, setExpectedQty] = useState<number>(2500);
  const [receivedQty, setReceivedQty] = useState<number>(2480);
  const [uom, setUom] = useState('ml');
  const [temperature, setTemperature] = useState<number>(76);
  const [chefName, setChefName] = useState('Chef Rajesh');
  const [qcSupervisor, setQcSupervisor] = useState('Sunil Nair');
  const [notes, setNotes] = useState('Complies with hot holding SOP standard.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variance = receivedQty - expectedQty;
    onRecordReceipt({
      kitchen_order_id: 501,
      indent_id: 10,
      item_name: itemName,
      expected_qty: expectedQty,
      received_qty: receivedQty,
      uom,
      variance,
      temperature_celsius: temperature,
      chef_name: chefName,
      qc_supervisor: qcSupervisor,
      status: variance >= -50 ? 'accepted' : 'partial',
      notes,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Kitchen Handover & Quality Receipt Log
          </h4>
          <p className="text-xs text-slate-400">
            Log finished batches received from kitchen cook stations to staging racks. Verifies HACCP temperatures and portion yields.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Record Prepared Receipt
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Receipt ID</th>
                <th className="py-3.5">Prepared Item</th>
                <th className="py-3.5">Expected / Received</th>
                <th className="py-3.5">Batch Variance</th>
                <th className="py-3.5">Core Temp</th>
                <th className="py-3.5">Chef & QC Sign-off</th>
                <th className="py-3.5 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {receipts.map((r) => (
                <tr key={r.receipt_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                    REC-{r.receipt_id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-100">{r.item_name}</div>
                    {r.notes && <div className="text-[11px] text-slate-400 mt-0.5">{r.notes}</div>}
                  </td>
                  <td className="py-3 font-mono text-slate-200">
                    {r.expected_qty} → <strong className="text-white">{r.received_qty} {r.uom}</strong>
                  </td>
                  <td className="py-3 font-mono font-semibold">
                    {r.variance === 0 ? (
                      <span className="text-emerald-400">0.0 (Perfect)</span>
                    ) : r.variance > 0 ? (
                      <span className="text-cyan-400">+{r.variance} {r.uom}</span>
                    ) : (
                      <span className="text-amber-400">{r.variance} {r.uom}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 font-mono text-slate-200">
                      <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                      <span>{r.temperature_celsius}°C</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">
                    <div>Chef: {r.chef_name}</div>
                    <div className="text-[11px] text-slate-400">QC: {r.qc_supervisor}</div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Badge variant={r.status === 'accepted' ? 'success' : 'warning'} size="sm">
                      {r.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Prepared Item Receipt"
        subtitle="Verify kitchen output before moving to packing station"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Prepared Dish / Item Name</label>
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
              <label className="block text-xs text-slate-400 mb-1">Expected Qty</label>
              <input
                type="number"
                required
                value={expectedQty}
                onChange={(e) => setExpectedQty(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Received Qty</label>
              <input
                type="number"
                required
                value={receivedQty}
                onChange={(e) => setReceivedQty(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">UoM</label>
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Core Temp (°C)</label>
              <input
                type="number"
                required
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lead Chef</label>
              <input
                type="text"
                required
                value={chefName}
                onChange={(e) => setChefName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">QC Supervisor</label>
              <input
                type="text"
                required
                value={qcSupervisor}
                onChange={(e) => setQcSupervisor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Quality Inspection Notes</label>
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
            <Button type="submit" variant="primary" size="sm">
              Confirm Receipt to Staging
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
