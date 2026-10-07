import React, { useState } from 'react';
import { MenuMaster, ItemMaster, PackageMaster } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Plus, Package, Layers, Scale } from 'lucide-react';

interface RecipePackagingViewProps {
  menus: MenuMaster[];
  items: ItemMaster[];
  packages: PackageMaster[];
  selectedMenuId?: number;
  onAddRecipeItem: (menuId: number, itemId: number, qty: number) => void;
  onAddPackageMapping: (menuId: number, packageId: number, packingGroup: number) => void;
}

export const RecipePackagingView: React.FC<RecipePackagingViewProps> = ({
  menus,
  items,
  packages,
  selectedMenuId,
  onAddRecipeItem,
  onAddPackageMapping,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number>(
    selectedMenuId || menus[0]?.menu_id || 1
  );

  // Form states
  const [selectedItemId, setSelectedItemId] = useState<number>(items[0]?.item_id || 1);
  const [itemQty, setItemQty] = useState<number>(0.2);
  const [selectedPkgId, setSelectedPkgId] = useState<number>(packages[0]?.package_id || 1);
  const [packingGroup, setPackingGroup] = useState<number>(1);

  const activeMenu = menus.find((m) => m.menu_id === activeMenuId);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenu) return;
    onAddRecipeItem(activeMenu.menu_id, selectedItemId, Number(itemQty));
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenu) return;
    onAddPackageMapping(activeMenu.menu_id, selectedPkgId, Number(packingGroup));
  };

  return (
    <div className="space-y-6">
      {/* Menu Selector Strip */}
      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-brand-400" />
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Recipe & Packaging BOM Engine</h4>
            <p className="text-xs text-slate-400">Select dish to inspect or link recipe items and containers</p>
          </div>
        </div>

        <select
          value={activeMenuId}
          onChange={(e) => setActiveMenuId(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500 max-w-xs"
        >
          {menus.map((m) => (
            <option key={m.menu_id} value={m.menu_id}>
              {m.name} ({m.code})
            </option>
          ))}
        </select>
      </div>

      {activeMenu ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recipe Ingredients BOM */}
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-brand-400" />
                <h4 className="text-sm font-semibold text-white">Recipe Ingredients (Per Portion)</h4>
              </div>
              <Badge variant="brand" size="sm">
                {activeMenu.recipe_items?.length || 0} Ingredients
              </Badge>
            </div>

            {/* Existing ingredients table */}
            <div className="space-y-2">
              {(!activeMenu.recipe_items || activeMenu.recipe_items.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No recipe items mapped yet.
                </div>
              ) : (
                activeMenu.recipe_items.map((r) => {
                  const item = items.find((i) => i.item_id === r.item_id) || r.item;
                  return (
                    <div
                      key={r.map_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{item?.name}</span>
                        <div className="text-[11px] text-slate-400">
                          Category: {item?.category || 'Kitchen Base'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-brand-400 text-sm">
                          {r.quantity} {item?.uom || ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Ingredient Form */}
            <form onSubmit={handleAddIngredient} className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                + Link Ingredient to Recipe
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(Number(e.target.value))}
                  className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  {items.map((it) => (
                    <option key={it.item_id} value={it.item_id}>
                      {it.name} ({it.uom})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Qty"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>

              <Button type="submit" variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                Add to BOM
              </Button>
            </form>
          </div>

          {/* Right: Packaging Material Mappings */}
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Packaging & Container Maps</h4>
              </div>
              <Badge variant="success" size="sm">
                Auto-assigned on Indent
              </Badge>
            </div>

            {/* Packaging mappings list */}
            <div className="space-y-2">
              {packages.slice(0, 3).map((pkg) => (
                <div
                  key={pkg.package_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{pkg.name}</span>
                    <p className="text-[11px] text-slate-400">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="neutral" size="sm">
                      1 Unit / Dish
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Packaging Form */}
            <form onSubmit={handleAddPackage} className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                + Link Packaging Container
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(Number(e.target.value))}
                  className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.package_id} value={pkg.package_id}>
                      {pkg.name} ({pkg.capacity || 'Std'})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={packingGroup}
                  onChange={(e) => setPackingGroup(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  placeholder="Group #"
                />
              </div>

              <Button type="submit" variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                Link Container
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
