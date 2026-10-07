import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reconciliationApi } from '../../api/reconciliationApi';
import { VarianceReportView } from './VarianceReportView';
import { ExternalSyncModal } from './ExternalSyncModal';
import { useUIStore } from '../../store/uiStore';
import { ReconciliationStatus } from '../../types';

export const ReconciliationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: records = [] } = useQuery({
    queryKey: ['reconciliation_records'],
    queryFn: () => reconciliationApi.getReconciliationRecords(),
  });

  const { data: summary } = useQuery({
    queryKey: ['reconciliation_summary'],
    queryFn: () => reconciliationApi.getSummary(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({
      reconciliationId,
      action,
    }: {
      reconciliationId: string;
      action: { status: ReconciliationStatus; resolutionNotes: string; reviewedBy: string };
    }) => reconciliationApi.resolveRecord(reconciliationId, action),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation_records'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation_summary'] });
      addToast({
        type: 'success',
        title: 'Variance Decision Recorded',
        message: `Audit entry for ${updated.order_id} marked as ${updated.status}.`,
      });
    },
  });

  const handleImportComplete = (channel: string) => {
    queryClient.invalidateQueries({ queryKey: ['reconciliation_records'] });
    queryClient.invalidateQueries({ queryKey: ['reconciliation_summary'] });
    addToast({
      type: 'success',
      title: 'Settlement File Reconciled',
      message: `Processed statement for ${channel.toUpperCase()}. Discrepancies flagged.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Billing System Reconciliation Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">
          Detect and resolve variances between internal GMV billing and external aggregators (Swiggy, Zomato, offline POS counter).
        </p>
      </div>

      <VarianceReportView
        records={records}
        summary={summary}
        onResolveRecord={(reconciliationId, action) =>
          resolveMutation.mutate({ reconciliationId, action })
        }
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      <ExternalSyncModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};
