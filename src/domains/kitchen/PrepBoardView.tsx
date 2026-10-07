import React, { useState } from 'react';
import { KitchenOrder } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Flame, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

interface PrepBoardViewProps {
  orders: KitchenOrder[];
  onUpdateStatus: (
    kitchenOrderId: number,
    newStatus: 'queued' | 'in_prep' | 'qc_passed' | 'ready_to_pack'
  ) => void;
}

const STATIONS = [
  { id: 'all', label: 'All Stations' },
  { id: 'curry', label: 'Curry & Gravy Pod' },
  { id: 'biryani', label: 'Dum Biryani Pod' },
  { id: 'tandoor', label: 'Tandoor & Breads' },
];

const COLUMNS: {
  id: 'queued' | 'in_prep' | 'qc_passed' | 'ready_to_pack';
  title: string;
  badgeVariant: 'neutral' | 'warning' | 'info' | 'success';
}[] = [
  { id: 'queued', title: '1. Queued for Cook', badgeVariant: 'neutral' },
  { id: 'in_prep', title: '2. Cooking / Simmering', badgeVariant: 'warning' },
  { id: 'qc_passed', title: '3. QC & Temp Passed', badgeVariant: 'info' },
  { id: 'ready_to_pack', title: '4. Ready to Pack', badgeVariant: 'success' },
];

export const PrepBoardView: React.FC<PrepBoardViewProps> = ({ orders, onUpdateStatus }) => {
  const [stationFilter, setStationFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    if (stationFilter === 'all') return true;
    return o.station === stationFilter;
  });

  return (
    <div className="space-y-5">
      {/* Station Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATIONS.map((st) => (
          <button
            key={st.id}
            onClick={() => setStationFilter(st.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              stationFilter === st.id
                ? 'bg-brand-500 text-white font-semibold'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 4-column Kanban Preparation Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colItems = filteredOrders.filter((o) => (o.status || 'queued') === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-850/60 rounded-t-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{col.title}</span>
                <Badge variant={col.badgeVariant} size="sm">
                  {colItems.length}
                </Badge>
              </div>

              {/* Items List */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colItems.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-600">No tickets</div>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={item.kitchen_order_id}
                      className="bg-slate-850 border border-slate-750 rounded-xl p-3.5 shadow-sm space-y-3 hover:border-slate-650 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-slate-800 text-brand-400 px-1.5 py-0.5 rounded">
                            {item.batch_number || `KO-${item.kitchen_order_id}`}
                          </span>
                          <h5 className="font-bold text-slate-100 text-xs mt-1.5 leading-snug">
                            {item.menu?.name || item.item?.name}
                          </h5>
                        </div>
                        <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {item.quantity} {item.item?.uom || 'Portions'}
                        </span>
                      </div>

                      {item.special_instructions && (
                        <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 leading-relaxed flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{item.special_instructions}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="capitalize">{item.station} Pod</span>
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>ETA {item.target_completion_time || '15m'}</span>
                        </div>
                      </div>

                      {/* Transition Button */}
                      <div className="pt-1">
                        {col.id === 'queued' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => onUpdateStatus(item.kitchen_order_id, 'in_prep')}
                            icon={<Flame className="h-3 w-3 text-brand-400" />}
                          >
                            Start Cooking
                          </Button>
                        )}
                        {col.id === 'in_prep' && (
                          <Button
                            variant="warning"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => onUpdateStatus(item.kitchen_order_id, 'qc_passed')}
                            icon={<CheckCircle className="h-3 w-3" />}
                          >
                            Pass QC Inspection
                          </Button>
                        )}
                        {col.id === 'qc_passed' && (
                          <Button
                            variant="success"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => onUpdateStatus(item.kitchen_order_id, 'ready_to_pack')}
                            icon={<ChevronRight className="h-3 w-3" />}
                          >
                            Move to Staging
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
