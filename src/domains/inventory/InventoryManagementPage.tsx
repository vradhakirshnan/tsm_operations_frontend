import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventoryApi';
import { StockOverviewView } from './StockOverviewView';
import { PurchaseReceiptsView } from './PurchaseReceiptsView';
import { KitchenIssuesView } from './KitchenIssuesView';
import { PackingIssuesView } from './PackingIssuesView';
import { ExpiryWriteOffView } from './ExpiryWriteOffView';
import { Tabs } from '../../components/common/Tabs';
import { useUIStore } from '../../store/uiStore';
import { Boxes, Truck, Flame, Package, Trash2 } from 'lucide-react';

export const InventoryManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'grn' | 'kitchen_issues' | 'packing_issues' | 'write_offs'>('stock');
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: stockItems = [] } = useQuery({
    queryKey: ['inventory_stock'],
    queryFn: () => inventoryApi.getStockOverview(),
  });

  const { data: purchaseReceipts = [] } = useQuery({
    queryKey: ['purchase_receipts'],
    queryFn: () => inventoryApi.getPurchaseReceipts(),
  });

  const { data: kitchenIssues = [] } = useQuery({
    queryKey: ['kitchen_issues'],
    queryFn: () => inventoryApi.getKitchenIssues(),
  });

  const { data: packingIssues = [] } = useQuery({
    queryKey: ['packing_issues'],
    queryFn: () => inventoryApi.getPackingIssues(),
  });

  const { data: writeOffs = [] } = useQuery({
    queryKey: ['stock_write_offs'],
    queryFn: () => inventoryApi.getStockWriteOffs(),
  });

  const recordGrnMutation = useMutation({
    mutationFn: (dto: Parameters<typeof inventoryApi.recordPurchaseReceipt>[0]) =>
      inventoryApi.recordPurchaseReceipt(dto),
    onSuccess: (rec) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_receipts'] });
      addToast({
        type: 'success',
        title: 'GRN Recorded',
        message: `${rec.receipt_id} logged and stock updated.`,
      });
    },
  });

  const createKitchenIssueMutation = useMutation({
    mutationFn: (dto: Parameters<typeof inventoryApi.createKitchenIssue>[0]) =>
      inventoryApi.createKitchenIssue(dto),
    onSuccess: (iss) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_issues'] });
      addToast({
        type: 'info',
        title: 'Stock Issued to Kitchen',
        message: `${iss.issue_id} dispatched to ${iss.station}.`,
      });
    },
  });

  const createPackingIssueMutation = useMutation({
    mutationFn: (dto: Parameters<typeof inventoryApi.createPackingIssue>[0]) =>
      inventoryApi.createPackingIssue(dto),
    onSuccess: (iss) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
      queryClient.invalidateQueries({ queryKey: ['packing_issues'] });
      addToast({
        type: 'info',
        title: 'Packaging Supplies Issued',
        message: `${iss.issue_id} transferred to ${iss.station}.`,
      });
    },
  });

  const recordWriteOffMutation = useMutation({
    mutationFn: (dto: Parameters<typeof inventoryApi.recordStockWriteOff>[0]) =>
      inventoryApi.recordStockWriteOff(dto),
    onSuccess: (w) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock_write_offs'] });
      addToast({
        type: 'warning',
        title: 'Stock Written Off',
        message: `${w.write_off_id} logged under ${w.reason}.`,
      });
    },
  });

  const tabs = [
    {
      id: 'stock',
      label: 'Inventory Stock Levels',
      count: stockItems.length,
      icon: <Boxes className="h-4 w-4" />,
    },
    {
      id: 'grn',
      label: 'Purchase Receipts (GRN)',
      count: purchaseReceipts.length,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      id: 'kitchen_issues',
      label: 'Kitchen Station Issues',
      count: kitchenIssues.length,
      icon: <Flame className="h-4 w-4" />,
    },
    {
      id: 'packing_issues',
      label: 'Packing Line Issues',
      count: packingIssues.length,
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: 'write_offs',
      label: 'Expiry & Write-Offs',
      count: writeOffs.length,
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Inventory & Supply Chain Hub</h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor raw food materials and packaging stock, process PO receipts, control department issues, and record write-offs.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      {activeTab === 'stock' && <StockOverviewView stockItems={stockItems} />}

      {activeTab === 'grn' && (
        <PurchaseReceiptsView
          receipts={purchaseReceipts}
          onRecordReceipt={(dto) => recordGrnMutation.mutate(dto)}
        />
      )}

      {activeTab === 'kitchen_issues' && (
        <KitchenIssuesView
          issues={kitchenIssues}
          onCreateIssue={(dto) => createKitchenIssueMutation.mutate(dto)}
        />
      )}

      {activeTab === 'packing_issues' && (
        <PackingIssuesView
          issues={packingIssues}
          onCreateIssue={(dto) => createPackingIssueMutation.mutate(dto)}
        />
      )}

      {activeTab === 'write_offs' && (
        <ExpiryWriteOffView
          writeOffs={writeOffs}
          onRecordWriteOff={(dto) => recordWriteOffMutation.mutate(dto)}
        />
      )}
    </div>
  );
};
