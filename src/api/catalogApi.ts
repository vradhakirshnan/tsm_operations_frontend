import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { ItemMaster, MenuMaster, PackageMaster, MenuItemMap, MenuPackageMap } from '../types';
import { mockItems, mockMenus, mockPackages } from './mockData';

let itemsStore: ItemMaster[] = [...mockItems];
let menusStore: MenuMaster[] = [...mockMenus];
let packagesStore: PackageMaster[] = [...mockPackages];

export const catalogApi = {
  async getItems(): Promise<ItemMaster[]> {
    try {
      const response = await apiClient.get<ItemMaster[]>(API_ENDPOINTS.CATALOG.ITEMS);
      return response.data;
    } catch {
      return [...itemsStore];
    }
  },

  async createItem(dto: Omit<ItemMaster, 'item_id'>): Promise<ItemMaster> {
    try {
      const response = await apiClient.post<ItemMaster>(API_ENDPOINTS.CATALOG.ITEMS, dto);
      return response.data;
    } catch {
      const newItem: ItemMaster = {
        item_id: itemsStore.length + 1,
        ...dto,
      };
      itemsStore.push(newItem);
      return newItem;
    }
  },

  async getMenus(): Promise<MenuMaster[]> {
    try {
      const response = await apiClient.get<MenuMaster[]>(API_ENDPOINTS.CATALOG.MENUS);
      return response.data;
    } catch {
      return [...menusStore];
    }
  },

  async createMenu(dto: Partial<MenuMaster>): Promise<MenuMaster> {
    try {
      const response = await apiClient.post<MenuMaster>(API_ENDPOINTS.CATALOG.MENUS, dto);
      return response.data;
    } catch {
      const newMenu: MenuMaster = {
        menu_id: menusStore.length + 1,
        name: dto.name || 'Untitled Menu',
        code: dto.code || `MNU-${Date.now().toString().slice(-4)}`,
        description: dto.description || '',
        allow_fractions: dto.allow_fractions ?? false,
        price: dto.price || 199,
        category: dto.category || 'Mains',
        recipe_items: dto.recipe_items || [],
      };
      menusStore.push(newMenu);
      return newMenu;
    }
  },

  async getPackages(): Promise<PackageMaster[]> {
    return [...packagesStore];
  },

  async addRecipeMapping(menuId: number, itemId: number, qty: number): Promise<MenuItemMap> {
    const item = itemsStore.find((i) => i.item_id === itemId);
    const menu = menusStore.find((m) => m.menu_id === menuId);
    const mapping: MenuItemMap = {
      map_id: Date.now(),
      menu_id: menuId,
      item_id: itemId,
      quantity: qty,
      item,
    };
    if (menu) {
      if (!menu.recipe_items) menu.recipe_items = [];
      menu.recipe_items.push(mapping);
    }
    return mapping;
  },

  async addPackageMapping(menuId: number, packageId: number, packingGroup: number): Promise<MenuPackageMap> {
    const pkg = packagesStore.find((p) => p.package_id === packageId);
    const menu = menusStore.find((m) => m.menu_id === menuId);
    const mapping: MenuPackageMap = {
      map_id: Date.now(),
      menu_id: menuId,
      package_id: packageId,
      packing_group: packingGroup,
      enabled: true,
      package: pkg,
    };
    if (menu) {
      if (!menu.packaging_mappings) menu.packaging_mappings = [];
      menu.packaging_mappings.push(mapping);
    }
    return mapping;
  },
};
