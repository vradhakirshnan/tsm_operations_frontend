import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalogApi';
import { ItemMasterView } from './ItemMasterView';
import { MenuMasterView } from './MenuMasterView';
import { RecipePackagingView } from './RecipePackagingView';
import { Tabs } from '../../components/common/Tabs';
import { useUIStore } from '../../store/uiStore';
import { MenuMaster, ItemMaster } from '../../types';
import { Utensils, Layers, Package } from 'lucide-react';

export const MenuManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menus' | 'items' | 'recipes'>('menus');
  const [inspectedMenu, setInspectedMenu] = useState<MenuMaster | null>(null);
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: items = [] } = useQuery({
    queryKey: ['catalog_items'],
    queryFn: () => catalogApi.getItems(),
  });

  const { data: menus = [] } = useQuery({
    queryKey: ['catalog_menus'],
    queryFn: () => catalogApi.getMenus(),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['catalog_packages'],
    queryFn: () => catalogApi.getPackages(),
  });

  const createItemMutation = useMutation({
    mutationFn: (item: Omit<ItemMaster, 'item_id'>) => catalogApi.createItem(item),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['catalog_items'] });
      addToast({
        type: 'success',
        title: 'Item Created',
        message: `${newItem.name} saved to Item Master.`,
      });
    },
  });

  const createMenuMutation = useMutation({
    mutationFn: (menu: Partial<MenuMaster>) => catalogApi.createMenu(menu),
    onSuccess: (newMenu) => {
      queryClient.invalidateQueries({ queryKey: ['catalog_menus'] });
      addToast({
        type: 'success',
        title: 'Menu Created',
        message: `${newMenu.name} saved with code ${newMenu.code}.`,
      });
    },
  });

  const addRecipeItemMutation = useMutation({
    mutationFn: ({ menuId, itemId, qty }: { menuId: number; itemId: number; qty: number }) =>
      catalogApi.addRecipeMapping(menuId, itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog_menus'] });
      addToast({
        type: 'success',
        title: 'Ingredient Linked',
        message: 'Recipe Bill of Materials updated.',
      });
    },
  });

  const addPackageMappingMutation = useMutation({
    mutationFn: ({ menuId, packageId, packingGroup }: { menuId: number; packageId: number; packingGroup: number }) =>
      catalogApi.addPackageMapping(menuId, packageId, packingGroup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog_menus'] });
      addToast({
        type: 'success',
        title: 'Packaging Linked',
        message: 'Packaging group container requirement saved.',
      });
    },
  });

  const handleSelectMenuForRecipe = (menu: MenuMaster) => {
    setInspectedMenu(menu);
    setActiveTab('recipes');
  };

  const tabs = [
    {
      id: 'menus',
      label: 'Menu Items & Combos',
      count: menus.length,
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      id: 'items',
      label: 'Raw Items & Gravies (Item Master)',
      count: items.length,
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'recipes',
      label: 'Recipe BOM & Packaging Maps',
      icon: <Package className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Menu, Recipes & Packaging Master</h2>
        <p className="text-xs text-slate-400 mt-1">
          Define customer menu dishes, raw item bill of materials (BOM), portion fractions, and packaging container specs.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      {activeTab === 'menus' && (
        <MenuMasterView
          menus={menus}
          onCreateMenu={(m) => createMenuMutation.mutate(m)}
          onSelectMenuForRecipe={handleSelectMenuForRecipe}
        />
      )}

      {activeTab === 'items' && (
        <ItemMasterView
          items={items}
          onCreateItem={(it) => createItemMutation.mutate(it)}
        />
      )}

      {activeTab === 'recipes' && (
        <RecipePackagingView
          menus={menus}
          items={items}
          packages={packages}
          selectedMenuId={inspectedMenu?.menu_id}
          onAddRecipeItem={(menuId, itemId, qty) =>
            addRecipeItemMutation.mutate({ menuId, itemId, qty })
          }
          onAddPackageMapping={(menuId, packageId, packingGroup) =>
            addPackageMappingMutation.mutate({ menuId, packageId, packingGroup })
          }
        />
      )}
    </div>
  );
};
