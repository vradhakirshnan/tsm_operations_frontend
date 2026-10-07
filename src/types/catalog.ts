export type UOMType = 'ml' | 'gms' | 'kg' | 'nos';

export interface ItemMaster {
  item_id: number;
  name: string;
  uom: UOMType;
  is_gravy: boolean;
  category?: string;
  current_stock?: number;
  cost_per_unit?: number;
}

export interface MenuItemMap {
  map_id: number;
  menu_id: number;
  item_id: number;
  quantity: number;
  item?: ItemMaster;
}

export interface PackageMaster {
  package_id: number;
  name: string;
  description?: string | null;
  capacity?: string | null;
  current_stock?: number;
}

export interface MenuPackageMap {
  map_id: number;
  menu_id: number;
  packing_group: number;
  package_id: number;
  enabled: boolean;
  package?: PackageMaster;
}

export interface MenuItemPackageMap {
  menu_item_package_id: number;
  map_id: number;
  menu_id: number;
  item_id: number;
  max_qty?: number | null;
}

export interface MenuMaster {
  menu_id: number;
  name: string;
  description?: string | null;
  code?: string | null;
  allow_fractions: boolean;
  price?: number;
  category?: string;
  recipe_items?: MenuItemMap[];
  packaging_mappings?: MenuPackageMap[];
}
