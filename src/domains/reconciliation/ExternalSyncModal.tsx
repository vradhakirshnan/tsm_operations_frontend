import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { UploadCloud, Check } from 'lucide-react';

interface ExternalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (channel: string) => void;
}

export const ExternalSyncModal: React.FC<ExternalSyncModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [channel, setChannel] = useState<'swiggy' | 'zomato' | 'razorpay'>('zomato');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportComplete(channel);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import External Billing Data / Settlement CSV"
      subtitle="Reconcile internal sales against external aggregator payouts"
      maxWidth="md"
    >
      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Source Aggregator / Gateway</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase font-semibold"
          >
            <option value="zomato">Zomato Merchant Payout Statement</option>
            <option value="swiggy">Swiggy Partner Settlement CSV</option>
            <option value="razorpay">Razorpay Gateway Transaction Report</option>
          </select>
        </div>

        {/* Drag and drop upload zone */}
        <div className="border-2 border-dashed border-slate-750 rounded-xl p-6 text-center hover:border-brand-500 transition-colors bg-slate-850/50">
          <UploadCloud className="h-10 w-10 text-brand-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-200">
            {fileName || 'Click to select or drop payout statement (.csv, .xlsx)'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supports Zomato & Swiggy standard settlement payout templates
          </p>

          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="fileUploadInput"
          />

          <label
            htmlFor="fileUploadInput"
            className="mt-3 inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-lg cursor-pointer border border-slate-700 font-medium"
          >
            Choose Local File
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isProcessing}
            icon={<Check className="h-4 w-4" />}
          >
            Parse & Reconcile Statement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
