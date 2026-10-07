import React, { useState } from 'react';
import { MenuMaster } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus, Search, Layers } from 'lucide-react';

interface MenuMasterViewProps {
  menus: MenuMaster[];
  onCreateMenu: (menu: Partial<MenuMaster>) => void;
  onSelectMenuForRecipe: (menu: MenuMaster) => void;
}

export const MenuMasterView: React.FC<MenuMasterViewProps> = ({
  menus,
  onCreateMenu,
  onSelectMenuForRecipe,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState<number>(299);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mains');
  const [allowFractions, setAllowFractions] = useState(false);

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateMenu({
      name: name.trim(),
      code: code.trim().toUpperCase() || undefined,
      price,
      description: description.trim() || undefined,
      category,
      allow_fractions: allowFractions,
    });

    setName('');
    setCode('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu items or combos..."
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
          Add Menu Item / Combo
        </Button>
      </div>

      {/* Grid of Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenus.map((menu) => (
          <div
            key={menu.menu_id}
            className="bg-slate-850 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{menu.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[11px] bg-slate-800 text-brand-400 px-1.5 py-0.5 rounded font-semibold">
                      {menu.code || `MNU-${menu.menu_id}`}
                    </span>
                    <span className="text-xs text-slate-400">{menu.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-white">₹{menu.price}</span>
                </div>
              </div>

              {menu.description && (
                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {menu.description}
                </p>
              )}

              {/* Recipe Ingredients Counter */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-brand-400" />
                  <span>
                    Recipe BOM:{' '}
                    <strong className="text-slate-200">
                      {menu.recipe_items?.length || 0} Ingredients
                    </strong>
                  </span>
                </span>

                <Badge variant={menu.allow_fractions ? 'info' : 'default'} size="sm">
                  {menu.allow_fractions ? 'Fractions Allowed' : 'Whole Nos Only'}
                </Badge>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectMenuForRecipe(menu)}
                icon={<Layers className="h-3.5 w-3.5" />}
              >
                Configure Recipe BOM
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Menu Master Item"
        subtitle="Customer facing dish or combo specification"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Menu Item Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Chicken Dum Biryani"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Menu Code (SKU)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BIRYANI-ROYAL"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
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
              placeholder="Biryani & Rice, Mains, Desserts..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Flavor notes, spice level, ingredients included..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fractionCheck"
              checked={allowFractions}
              onChange={(e) => setAllowFractions(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="fractionCheck" className="text-xs text-slate-300">
              Allow fractions (e.g. 0.5 portion)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Menu Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
