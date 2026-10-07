import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/ordersApi';
import { kitchenApi } from '../../api/kitchenApi';
import { inventoryApi } from '../../api/inventoryApi';
import { dispatchApi } from '../../api/dispatchApi';
import { reconciliationApi } from '../../api/reconciliationApi';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ShoppingBag,
  Flame,
  Boxes,
  Bike,
  Scale,
  PlusCircle,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OperationsOverview: React.FC = () => {
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  });

  const { data: kitchenOrders = [] } = useQuery({
    queryKey: ['prep_board'],
    queryFn: () => kitchenApi.getPrepBoardOrders(),
  });

  const { data: stockItems = [] } = useQuery({
    queryKey: ['inventory_stock'],
    queryFn: () => inventoryApi.getStockOverview(),
  });

  const { data: dispatchQueue = [] } = useQuery({
    queryKey: ['dispatch_queue'],
    queryFn: () => dispatchApi.getDispatchQueue(),
  });

  const { data: recSummary } = useQuery({
    queryKey: ['reconciliation_summary'],
    queryFn: () => reconciliationApi.getSummary(),
  });

  // Calculate high-level operational indicators
  const activeOrdersCount = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'dispatched').length;
  const cookingKOTCount = kitchenOrders.filter((k) => k.status === 'in_prep').length;
  const readyToPackKOTCount = kitchenOrders.filter((k) => k.status === 'ready_to_pack').length;
  const lowStockCount = stockItems.filter((s) => s.current_stock <= s.min_reorder_level).length;
  const pendingDispatchCount = dispatchQueue.filter((d) => d.status !== 'delivered' && d.status !== 'handed_over').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">Operations Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-brand kitchen monitoring, order intake, inventory flow, and dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/orders')}
            icon={<PlusCircle className="h-4 w-4" />}
          >
            New Customer Order
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/kitchen')}
            icon={<ClipboardList className="h-4 w-4" />}
          >
            Kitchen Indent
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Live Orders"
          value={activeOrdersCount}
          subtitle={`${orders.filter((o) => o.status === 'ready').length} ready for dispatch`}
          icon={<ShoppingBag className="h-5 w-5" />}
          variant="brand"
          trend={{ value: '+12% vs last hr', isPositive: true }}
        />

        <StatCard
          title="Kitchen Prep Workload"
          value={`${cookingKOTCount} In-Prep`}
          subtitle={`${readyToPackKOTCount} finished & awaiting packaging`}
          icon={<Flame className="h-5 w-5" />}
          variant="warning"
        />

        <StatCard
          title="Stock Alerts"
          value={`${lowStockCount} Items`}
          subtitle="Below minimum reorder threshold"
          icon={<Boxes className="h-5 w-5" />}
          variant={lowStockCount > 0 ? 'danger' : 'success'}
        />

        <StatCard
          title="Pending Dispatches"
          value={pendingDispatchCount}
          subtitle={`${dispatchQueue.filter((d) => d.status === 'rider_arrived').length} riders arrived at counter`}
          icon={<Bike className="h-5 w-5" />}
          variant="info"
        />
      </div>

      {/* Center 2-column layout: Live Orders Stream & Quick Ops Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Live Orders Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-100">Live Orders in Pipeline</span>
                <Badge variant="brand" size="sm" dot>
                  {orders.length} Total
                </Badge>
              </div>
            }
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/orders')}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                View All
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Channel</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.order_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-2 font-mono font-semibold text-brand-400">
                        {order.order_id}
                      </td>
                      <td className="py-3 text-slate-200">
                        <div className="font-medium">{order.customer?.name || 'Walk-in'}</div>
                        <div className="text-[11px] text-slate-400">{order.customer?.phone}</div>
                      </td>
                      <td className="py-3 text-slate-300">
                        {order.items.length} item(s)
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {order.items.map((i) => i.menu?.name).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 uppercase text-[11px] font-semibold text-slate-400">
                        {order.source_channel || 'direct'}
                      </td>
                      <td className="py-3 font-medium text-slate-100">
                        ₹{order.total_amount || 0}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            order.status === 'ready'
                              ? 'success'
                              : order.status === 'cooking'
                              ? 'warning'
                              : order.status === 'dispatched'
                              ? 'neutral'
                              : 'brand'
                          }
                          size="sm"
                          dot
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => navigate('/orders')}
                          className="text-brand-400 hover:text-brand-300 font-medium hover:underline"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Operations Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/customers')}
              className="bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                📍
              </div>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                Customer & Geolocation
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Pin delivery coordinates & manage address book.
              </p>
            </div>

            <div
              onClick={() => navigate('/kitchen')}
              className="bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                🍳
              </div>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                Kitchen Indent & KOT
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Batch cooking queues & prepared food receipts.
              </p>
            </div>

            <div
              onClick={() => navigate('/inventory')}
              className="bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                📦
              </div>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                Inventory & GRN
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Receipts, kitchen issues & expiry write-offs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Billing Reconciliation Status & Live Alerts */}
        <div className="space-y-6">
          {/* Billing Reconciliation KPI */}
          <Card
            title="Billing Reconciliation Status"
            subtitle="External Aggregators vs Internal GMV"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reconciliation')}
                icon={<Scale className="h-4 w-4" />}
              >
                Audit
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400">Clean Match Rate</span>
                <span className="text-base font-bold text-emerald-400">
                  {recSummary?.clean_match_rate || 94.7}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-750">
                  <span className="text-slate-400 block text-[11px]">Total Audited</span>
                  <span className="font-semibold text-slate-100 text-sm">
                    {recSummary?.total_orders_audited || 248} Orders
                  </span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-750">
                  <span className="text-slate-400 block text-[11px]">Net Variance</span>
                  <span className="font-semibold text-rose-400 text-sm">
                    ₹{recSummary?.net_variance || -2580}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-300">
                    {recSummary?.open_disputes_count || 3} Open Disputes Pending
                  </p>
                  <p className="text-amber-400/80 text-[11px] mt-0.5">
                    Aggregator commission variances flagged for finance desk resolution.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Low Stock Warning Card */}
          <Card title="Critical Stock Watchlist">
            <div className="space-y-2.5">
              {stockItems
                .filter((s) => s.current_stock <= s.min_reorder_level)
                .map((stock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-750 text-xs"
                  >
                    <div>
                      <p className="font-medium text-slate-200">{stock.name}</p>
                      <p className="text-[11px] text-rose-400">
                        {stock.current_stock} {stock.uom} remaining (Min: {stock.min_reorder_level})
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/inventory')}
                    >
                      PO Indent
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
