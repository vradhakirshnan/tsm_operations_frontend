import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '../../api/kitchenApi';
import { PrepBoardView } from './PrepBoardView';
import { KitchenIndentView } from './KitchenIndentView';
import { PreparedReceiptView } from './PreparedReceiptView';
import { PackingIndentView } from './PackingIndentView';
import { Tabs } from '../../components/common/Tabs';
import { useUIStore } from '../../store/uiStore';
import { Flame, ClipboardList, CheckCircle2, Package } from 'lucide-react';

export const KitchenDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prep_board' | 'indents' | 'receipts' | 'packing'>('prep_board');
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: prepOrders = [] } = useQuery({
    queryKey: ['prep_board'],
    queryFn: () => kitchenApi.getPrepBoardOrders(),
  });

  const { data: indents = [] } = useQuery({
    queryKey: ['kitchen_indents'],
    queryFn: () => kitchenApi.getIndents(),
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ['prepared_receipts'],
    queryFn: () => kitchenApi.getPreparedReceipts(),
  });

  const { data: packingReqs = [] } = useQuery({
    queryKey: ['packing_requirements'],
    queryFn: () => kitchenApi.getPackingRequirements(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      kitchenOrderId,
      newStatus,
    }: {
      kitchenOrderId: number;
      newStatus: 'queued' | 'in_prep' | 'qc_passed' | 'ready_to_pack';
    }) => kitchenApi.updatePrepOrderStatus(kitchenOrderId, newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['prep_board'] });
      addToast({
        type: 'info',
        title: 'KOT Stage Advanced',
        message: `Order batch ${updated.batch_number} updated to ${updated.status}.`,
      });
    },
  });

  const createIndentMutation = useMutation({
    mutationFn: (status: 'draft' | 'approved') => kitchenApi.createIndent(status),
    onSuccess: (newIndent) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_indents'] });
      addToast({
        type: 'success',
        title: 'Indent Created',
        message: `Production indent #${newIndent.indent_id} approved for floor execution.`,
      });
    },
  });

  const recordReceiptMutation = useMutation({
    mutationFn: (dto: Parameters<typeof kitchenApi.recordPreparedReceipt>[0]) =>
      kitchenApi.recordPreparedReceipt(dto),
    onSuccess: (rec) => {
      queryClient.invalidateQueries({ queryKey: ['prepared_receipts'] });
      addToast({
        type: 'success',
        title: 'Prepared Receipt Confirmed',
        message: `${rec.received_qty} ${rec.uom} of ${rec.item_name} accepted into staging.`,
      });
    },
  });

  const tabs = [
    {
      id: 'prep_board',
      label: 'KOT Station Prep Board',
      count: prepOrders.length,
      icon: <Flame className="h-4 w-4" />,
    },
    {
      id: 'indents',
      label: 'Consolidated Indents',
      count: indents.length,
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      id: 'receipts',
      label: 'Kitchen Handover Receipts',
      count: receipts.length,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      id: 'packing',
      label: 'Packing Material Quota',
      count: packingReqs.length,
      icon: <Package className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Kitchen Operations & KOT Display</h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor line stations, consolidate incoming orders into preparation indents, and manage verified handover receipts.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      {activeTab === 'prep_board' && (
        <PrepBoardView
          orders={prepOrders}
          onUpdateStatus={(kitchenOrderId, newStatus) =>
            updateStatusMutation.mutate({ kitchenOrderId, newStatus })
          }
        />
      )}

      {activeTab === 'indents' && (
        <KitchenIndentView
          indents={indents}
          onCreateIndent={(status) => createIndentMutation.mutate(status)}
        />
      )}

      {activeTab === 'receipts' && (
        <PreparedReceiptView
          receipts={receipts}
          onRecordReceipt={(dto) => recordReceiptMutation.mutate(dto)}
        />
      )}

      {activeTab === 'packing' && <PackingIndentView requirements={packingReqs} />}
    </div>
  );
};
