import React from 'react';
import { PackingRequirement } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackingIndentViewProps {
  requirements: PackingRequirement[];
}

export const PackingIndentView: React.FC<PackingIndentViewProps> = ({ requirements }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Intro strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Packaging Material Indents & Station Quota
          </h4>
          <p className="text-xs text-slate-400">
            Automated BOM packaging requirements based on active order indents. Ensures packing tables are fully stocked.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/inventory')}
          icon={<Package className="h-4 w-4" />}
        >
          Issue Packaging From Store
        </Button>
      </div>

      {/* Grid of packaging requirement cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requirements.map((req) => {
          const isSufficient = req.in_stock >= req.total_needed;
          return (
            <div
              key={req.package_id}
              className="bg-slate-850 border border-slate-800 rounded-xl p-5 hover:border-slate-750 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-slate-100 text-sm leading-snug">
                    {req.package_name}
                  </h5>
                  <Badge variant={isSufficient ? 'success' : 'danger'} size="sm">
                    {isSufficient ? 'Stock OK' : 'Shortage'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Needed for Indents</span>
                    <span className="font-mono font-bold text-white text-base">
                      {req.total_needed} Units
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Current Store Stock</span>
                    <span className="font-mono font-bold text-slate-200 text-base">
                      {req.in_stock} Units
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Used by Dishes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {req.associated_menus.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-750"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Buffer Safety: <strong className="text-emerald-400">+{req.in_stock - req.total_needed}</strong>
                </span>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>Dispatch Line</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
