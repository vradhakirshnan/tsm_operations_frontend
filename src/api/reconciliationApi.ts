import { BillingReconciliationRecord, ReconciliationSummary, ReconciliationStatus } from '../types';
import { mockReconciliationRecords } from './mockData';

let recordsStore: BillingReconciliationRecord[] = [...mockReconciliationRecords];

export const reconciliationApi = {
  async getReconciliationRecords(): Promise<BillingReconciliationRecord[]> {
    return [...recordsStore];
  },

  async getSummary(): Promise<ReconciliationSummary> {
    const totalOrders = recordsStore.length;
    const internalGmv = recordsStore.reduce((acc, r) => acc + r.internal_order_amount, 0);
    const externalSettled = recordsStore.reduce((acc, r) => acc + r.external_billed_amount, 0);
    const netVariance = recordsStore.reduce((acc, r) => acc + r.variance_amount, 0);
    const matchedCount = recordsStore.filter((r) => r.status === 'matched').length;
    const cleanRate = totalOrders > 0 ? (matchedCount / totalOrders) * 100 : 100;

    return {
      total_orders_audited: totalOrders,
      total_internal_gmv: internalGmv,
      total_external_settled: externalSettled,
      net_variance: netVariance,
      clean_match_rate: Math.round(cleanRate * 10) / 10,
      flagged_records_count: recordsStore.filter((r) => r.status === 'variance_flagged').length,
      open_disputes_count: recordsStore.filter((r) => r.status === 'disputed').length,
    };
  },

  async resolveRecord(
    reconciliationId: string,
    action: { status: ReconciliationStatus; resolutionNotes: string; reviewedBy: string }
  ): Promise<BillingReconciliationRecord> {
    const record = recordsStore.find((r) => r.reconciliation_id === reconciliationId);
    if (!record) throw new Error('Reconciliation record not found');

    record.status = action.status;
    record.resolution_action = action.resolutionNotes;
    record.reviewed_by = action.reviewedBy;
    record.resolved_at = new Date().toISOString();

    return { ...record };
  },

  async importExternalBillingFile(_sourceChannel: string, _fileData?: unknown): Promise<{ importedCount: number }> {
    // Simulates parsing external settlement CSV/JSON
    const count = Math.floor(15 + Math.random() * 20);
    return { importedCount: count };
  },
};
