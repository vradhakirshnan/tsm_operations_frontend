import React, { useState } from 'react';
import { ItemMaster, UOMType } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus, Search, Scale, Soup } from 'lucide-react';

interface ItemMasterViewProps {
  items: ItemMaster[];
  onCreateItem: (item: Omit<ItemMaster, 'item_id'>) => void;
}

export const ItemMasterView: React.FC<ItemMasterViewProps> = ({ items, onCreateItem }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [uom, setUom] = useState<UOMType>('kg');
  const [isGravy, setIsGravy] = useState(false);
  const [category, setCategory] = useState('Raw Ingredients');
  const [costPerUnit, setCostPerUnit] = useState<number>(100);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateItem({
      name: name.trim(),
      uom,
      is_gravy: isGravy,
      category,
      current_stock: 0,
      cost_per_unit: costPerUnit,
    });

    setName('');
    setIsGravy(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Create */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw items / bases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-850 border border-slate-750 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Master Item
        </Button>
      </div>

      {/* Items Table */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Item ID</th>
                <th className="py-3.5">Item Name</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">UoM</th>
                <th className="py-3.5">Base Type</th>
                <th className="py-3.5">Current Stock</th>
                <th className="py-3.5 pr-4 text-right">Avg Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <tr key={item.item_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-semibold text-brand-400">
                    ITM-{item.item_id}
                  </td>
                  <td className="py-3 font-medium text-slate-100 flex items-center gap-2">
                    {item.name}
                  </td>
                  <td className="py-3 text-slate-400">{item.category || 'Kitchen Item'}</td>
                  <td className="py-3">
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase">
                      {item.uom}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.is_gravy ? (
                      <Badge variant="warning" size="sm" dot>
                        <Soup className="h-3 w-3 mr-1" />
                        Gravy / Liquid
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        <Scale className="h-3 w-3 mr-1" />
                        Solid Item
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-slate-200 font-medium">
                    {item.current_stock ?? '--'} {item.uom}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-300">
                    ₹{item.cost_per_unit || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Food Item / Raw Material"
        subtitle="Item Master catalog definition"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Item Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saffron Basmati Biryani Rice"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Unit of Measure (UoM)</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value as UOMType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="gms">gms (Grams)</option>
                <option value="ml">ml (Milliliters)</option>
                <option value="nos">nos (Pieces / Count)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Avg Cost (₹)</label>
              <input
                type="number"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Meat & Poultry, Gravies & Bases, Dairy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isGravyCheck"
              checked={isGravy}
              onChange={(e) => setIsGravy(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="isGravyCheck" className="text-xs text-slate-300">
              Is Gravy / Liquid (requires leakproof container)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
