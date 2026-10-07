import React, { useState } from 'react';
import {
  BillingReconciliationRecord,
  ReconciliationSummary,
  ReconciliationStatus,
} from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  Scale,
  Search,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface VarianceReportViewProps {
  records: BillingReconciliationRecord[];
  summary?: ReconciliationSummary;
  onResolveRecord: (
    reconciliationId: string,
    action: { status: ReconciliationStatus; resolutionNotes: string; reviewedBy: string }
  ) => void;
  onOpenImportModal: () => void;
}

export const VarianceReportView: React.FC<VarianceReportViewProps> = ({
  records,
  summary,
  onResolveRecord,
  onOpenImportModal,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [activeResolutionRecord, setActiveResolutionRecord] =
    useState<BillingReconciliationRecord | null>(null);
  const [resolutionStatus, setResolutionStatus] =
    useState<ReconciliationStatus>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reviewedBy, setReviewedBy] = useState('Operations Auditor Priya');

  const filtered = records.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' || r.status === statusFilter;
    const matchesChannel =
      channelFilter === 'all' || r.source_channel === channelFilter;
    const matchesSearch =
      r.order_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.external_reference_id &&
        r.external_reference_id.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesChannel && matchesSearch;
  });

  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResolutionRecord) return;

    onResolveRecord(activeResolutionRecord.reconciliation_id, {
      status: resolutionStatus,
      resolutionNotes,
      reviewedBy,
    });
    setActiveResolutionRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clean Match Rate"
          value={`${summary?.clean_match_rate || 94.7}%`}
          subtitle="Orders zero variance between internal & external"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />

        <StatCard
          title="Internal Order GMV"
          value={`₹${summary?.total_internal_gmv.toLocaleString() || '148,500'}`}
          subtitle={`${summary?.total_orders_audited || 248} Total Audited Orders`}
          icon={<Scale className="h-5 w-5" />}
          variant="default"
        />

        <StatCard
          title="Net Variance Impact"
          value={`₹${summary?.net_variance || -2580}`}
          subtitle="Aggregator deduction mismatch"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="danger"
        />

        <StatCard
          title="Open Dispute Claims"
          value={`${summary?.open_disputes_count || 3} Tickets`}
          subtitle="Pending partner resolution"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'variance_flagged', 'disputed', 'resolved', 'matched'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 capitalize focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="swiggy">Swiggy</option>
            <option value="zomato">Zomato</option>
            <option value="direct_pos">Direct POS</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search order or txn ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenImportModal}
            icon={<FileSpreadsheet className="h-4 w-4" />}
          >
            Import External Statement
          </Button>
        </div>
      </div>

      {/* Audit Reconciliation Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Audit ID</th>
                <th className="py-3.5">Order ID & Txn</th>
                <th className="py-3.5">Channel</th>
                <th className="py-3.5">Internal GMV</th>
                <th className="py-3.5">External Settled</th>
                <th className="py-3.5">Variance (₹ / %)</th>
                <th className="py-3.5">Discrepancy Category</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((r) => {
                const hasVariance = r.variance_amount !== 0;
                return (
                  <tr key={r.reconciliation_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                      {r.reconciliation_id}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-100 font-mono">{r.order_id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.external_reference_id || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 uppercase font-bold text-slate-300">
                      {r.source_channel.replace('_', ' ')}
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-200">
                      ₹{r.internal_order_amount}
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-200">
                      ₹{r.external_billed_amount}
                    </td>
                    <td className="py-3 font-mono font-bold">
                      {r.variance_amount === 0 ? (
                        <span className="text-emerald-400">₹0 (0%)</span>
                      ) : (
                        <span className="text-rose-400">
                          ₹{r.variance_amount} ({r.variance_percent}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {r.category ? (
                        <span className="text-amber-300 font-medium">
                          {r.category.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                      {r.audit_notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {r.audit_notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          r.status === 'matched'
                            ? 'success'
                            : r.status === 'resolved'
                            ? 'info'
                            : r.status === 'disputed'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {r.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {hasVariance && r.status !== 'resolved' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveResolutionRecord(r);
                            setResolutionNotes(r.audit_notes || '');
                          }}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {activeResolutionRecord && (
        <Modal
          isOpen={!!activeResolutionRecord}
          onClose={() => setActiveResolutionRecord(null)}
          title={`Resolve Variance: ${activeResolutionRecord.order_id}`}
          subtitle={`Variance: ₹${activeResolutionRecord.variance_amount} against ${activeResolutionRecord.source_channel}`}
          maxWidth="md"
        >
          <form onSubmit={handleResolutionSubmit} className="space-y-4">
            <div className="p-3 bg-slate-800 rounded-lg text-xs space-y-1">
              <div>
                Internal Recorded GMV:{' '}
                <strong className="text-white">
                  ₹{activeResolutionRecord.internal_order_amount}
                </strong>
              </div>
              <div>
                External Aggregator Settlement:{' '}
                <strong className="text-white">
                  ₹{activeResolutionRecord.external_billed_amount}
                </strong>
              </div>
              <div className="text-rose-400 font-bold">
                Unreconciled Variance: ₹{activeResolutionRecord.variance_amount} (
                {activeResolutionRecord.variance_percent}%)
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Resolution Outcome</label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as ReconciliationStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="resolved">Mark Resolved (Ledger Adjustment)</option>
                <option value="disputed">Escalate Dispute to Aggregator Account Manager</option>
                <option value="in_review">Send to Senior Finance Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Audit Resolution Notes</label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter justification, aggregator ticket number, or accounting entry details..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Auditor Sign-off</label>
              <input
                type="text"
                required
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveResolutionRecord(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Audit Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
