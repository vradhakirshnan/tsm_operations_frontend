import React, { useState } from 'react';
import { PurchaseReceipt } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus } from 'lucide-react';

interface PurchaseReceiptsViewProps {
  receipts: PurchaseReceipt[];
  onRecordReceipt: (dto: Omit<PurchaseReceipt, 'receipt_id'>) => void;
}

export const PurchaseReceiptsView: React.FC<PurchaseReceiptsViewProps> = ({
  receipts,
  onRecordReceipt,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('PO-8845');
  const [vendorName, setVendorName] = useState('Premier Dairy & Poultry Suppliers');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-PREM-4021');
  const [receivedBy, setReceivedBy] = useState('Kiran Patel (Store In-charge)');
  const [itemName, setItemName] = useState('Fresh Malai Paneer Blocks');
  const [orderedQty, setOrderedQty] = useState<number>(30);
  const [receivedQty, setReceivedQty] = useState<number>(30);
  const [unitPrice, setUnitPrice] = useState<number>(340);
  const [uom, setUom] = useState('kg');
  const [batchNumber, setBatchNumber] = useState('BAT-PAN-0710-B');
  const [expiryDate, setExpiryDate] = useState('2026-10-12');
  const [notes, setNotes] = useState('Cold chain temp 4.1°C checked upon unloading.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordReceipt({
      po_number: poNumber,
      vendor_name: vendorName,
      invoice_number: invoiceNumber,
      receipt_date: new Date().toISOString(),
      received_by: receivedBy,
      total_amount: receivedQty * unitPrice,
      status: 'fully_received',
      notes,
      items: [
        {
          receipt_item_id: 1,
          item_id: 4, // Paneer
          name: itemName,
          ordered_qty: orderedQty,
          received_qty: receivedQty,
          unit_price: unitPrice,
          uom,
          batch_number: batchNumber,
          expiry_date: expiryDate,
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
            Goods Receipt Note (GRN) from Purchase Orders
          </h4>
          <p className="text-xs text-slate-400">
            Acknowledge delivery of raw materials and packaging supplies, assign internal batch codes, and track expiry dates.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Create Purchase GRN
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">GRN #</th>
                <th className="py-3.5">Vendor & Invoice</th>
                <th className="py-3.5">PO Number</th>
                <th className="py-3.5">Items Received</th>
                <th className="py-3.5">Total Value</th>
                <th className="py-3.5">Received By</th>
                <th className="py-3.5 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {receipts.map((rec) => (
                <tr key={rec.receipt_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                    {rec.receipt_id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-100">{rec.vendor_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Inv: {rec.invoice_number}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-300 font-semibold">{rec.po_number}</td>
                  <td className="py-3">
                    <div className="space-y-0.5">
                      {rec.items.map((it) => (
                        <div key={it.receipt_item_id} className="text-slate-200">
                          <strong>{it.received_qty} {it.uom}</strong> {it.name}
                          <span className="text-[11px] text-slate-400 ml-2 font-mono">
                            [Batch: {it.batch_number} • Exp: {it.expiry_date}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-100">
                    ₹{rec.total_amount}
                  </td>
                  <td className="py-3 text-slate-300">{rec.received_by}</td>
                  <td className="py-3 pr-4 text-right">
                    <Badge variant="success" size="sm">
                      {rec.status.toUpperCase()}
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
        title="Record Goods Receipt (GRN)"
        subtitle="Inward incoming stock delivery against PO"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">PO Reference Number</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vendor Invoice #</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Supplier / Vendor Name</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Store Receiver Name</label>
              <input
                type="text"
                required
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Item Delivery Specifics</span>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Item Received</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mt-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Ordered Qty</label>
                <input
                  type="number"
                  value={orderedQty}
                  onChange={(e) => setOrderedQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Received Qty</label>
                <input
                  type="number"
                  required
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">UoM</label>
                <input
                  type="text"
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Batch Code</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Quality & Storage Notes</label>
            <input
              type="text"
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
              Confirm Inward & Add Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
