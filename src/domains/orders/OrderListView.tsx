import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Search, Eye, Clock } from 'lucide-react';

interface OrderListViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onQuickStatusChange: (orderId: string, status: OrderStatus) => void;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'New / Placed', value: 'ordered' },
  { label: 'In Kitchen Cooking', value: 'cooking' },
  { label: 'Prepared & Ready', value: 'ready' },
  { label: 'Dispatched', value: 'dispatched' },
];

export const OrderListView: React.FC<OrderListViewProps> = ({
  orders,
  onSelectOrder,
  onQuickStatusChange,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.order_id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.phone.includes(search) ||
      order.items.some((i) => i.menu?.name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.value
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, customer, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-850 border border-slate-750 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Order ID</th>
                <th className="py-3.5">Customer & Phone</th>
                <th className="py-3.5">Time & Channel</th>
                <th className="py-3.5">Items Summary</th>
                <th className="py-3.5">Amount</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No orders match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                      {order.order_id}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-100">
                        {order.customer?.name || 'Walk-in'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.customer?.phone}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{new Date(order.order_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {order.source_channel || 'direct'}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs">
                      <div className="text-slate-200 font-medium truncate">
                        {order.items.map((i) => `${i.quantity}x ${i.menu?.name || 'Dish'}`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-100">
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
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'ordered' && (
                          <button
                            onClick={() => onQuickStatusChange(order.order_id, 'cooking')}
                            className="px-2 py-1 text-[11px] rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                          >
                            Cook
                          </button>
                        )}
                        {order.status === 'cooking' && (
                          <button
                            onClick={() => onQuickStatusChange(order.order_id, 'ready')}
                            className="px-2 py-1 text-[11px] rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                          >
                            Ready
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectOrder(order)}
                          icon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
