import React, { useState } from 'react';
import { InventoryItemStock } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Search } from 'lucide-react';

interface StockOverviewViewProps {
  stockItems: InventoryItemStock[];
}

export const StockOverviewView: React.FC<StockOverviewViewProps> = ({ stockItems }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = stockItems.filter((item) => {
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'raw_ingredient', 'semi_finished', 'packaging_material'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search item in inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-850 border border-slate-750 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Item Name</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Available Stock</th>
                <th className="py-3.5">Min Reorder Level</th>
                <th className="py-3.5">Batches</th>
                <th className="py-3.5">Stock Status</th>
                <th className="py-3.5 pr-4 text-right">Avg Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const isLow = item.current_stock <= item.min_reorder_level;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-4 font-semibold text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3 text-slate-400 capitalize">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 font-mono font-bold text-white">
                      {item.current_stock} {item.uom}
                    </td>
                    <td className="py-3 font-mono text-slate-400">
                      {item.min_reorder_level} {item.uom}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {item.batch_count} Active
                    </td>
                    <td className="py-3">
                      {isLow ? (
                        <Badge variant="danger" size="sm" dot>
                          Reorder Required
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>
                          Adequate
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-slate-200">
                      ₹{item.avg_unit_cost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
