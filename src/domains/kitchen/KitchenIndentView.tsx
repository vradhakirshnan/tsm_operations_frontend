import React, { useState } from 'react';
import { KitchenIndent } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Plus } from 'lucide-react';

interface KitchenIndentViewProps {
  indents: KitchenIndent[];
  onCreateIndent: (status: 'draft' | 'approved') => void;
}

export const KitchenIndentView: React.FC<KitchenIndentViewProps> = ({
  indents,
  onCreateIndent,
}) => {
  const [selectedIndentId, setSelectedIndentId] = useState<number>(
    indents[0]?.indent_id || 10
  );

  const selectedIndent = indents.find((i) => i.indent_id === selectedIndentId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Order Consolidation & Production Indents
          </h4>
          <p className="text-xs text-slate-400">
            Aggregates live customer orders into production batch instructions for head chefs and station leads.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onCreateIndent('approved')}
          icon={<Plus className="h-4 w-4" />}
        >
          Generate Consolidated Indent
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Indents List */}
        <div className="lg:col-span-1 bg-slate-850 rounded-xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
            Active Production Runs ({indents.length})
          </span>

          <div className="space-y-2.5">
            {indents.map((indent) => {
              const isSelected = indent.indent_id === selectedIndentId;
              return (
                <div
                  key={indent.indent_id}
                  onClick={() => setSelectedIndentId(indent.indent_id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-200">
                      INDENT #{indent.indent_id}
                    </span>
                    <Badge
                      variant={
                        indent.status === 'processed'
                          ? 'neutral'
                          : indent.status === 'approved'
                          ? 'success'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {indent.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>{indent.total_orders_consolidated || 12} customer orders</span>
                    <span>
                      {indent.created_at
                        ? new Date(indent.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Today'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Consolidated Breakdown */}
        <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-800 p-5 space-y-5">
          {selectedIndent ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Indent Production Manifest #{selectedIndent.indent_id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Consolidated requirement for 12 incoming lunch rush orders
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" size="md" dot>
                    Station Ready
                  </Badge>
                </div>
              </div>

              {/* Menu dish requirement lines */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Dish Volume Requirements
                </h4>
                <div className="space-y-2">
                  {selectedIndent.details?.map((detail) => (
                    <div
                      key={detail.detail_id}
                      className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">
                          {detail.menu?.name || `Dish #${detail.menu_id}`}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Code: {detail.menu?.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-brand-400 text-sm">
                          {detail.qty} Portions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredient Aggregation Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  2. Aggregate Ingredient Requisition (To Issue from Cold Store)
                </h4>
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-slate-300">
                    <span>🍗 Marinated Boneless Chicken</span>
                    <span className="font-mono font-bold text-white">4.3 kg</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-slate-300">
                    <span>🥣 Makhani Gravy Base</span>
                    <span className="font-mono font-bold text-white">1,760 ml</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-slate-300">
                    <span>🍚 Hyderabadi Dum Biryani Rice</span>
                    <span className="font-mono font-bold text-white">3.5 kg</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-slate-300">
                    <span>🫓 Garlic Butter Naan Dough</span>
                    <span className="font-mono font-bold text-white">28 Portions</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-slate-300">
                    <span>🥣 Dal Makhani Slow Cook Base</span>
                    <span className="font-mono font-bold text-white">1,500 ml</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              Select an indent to view line item instructions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
