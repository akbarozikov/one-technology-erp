/**
 * Company sites: branches, locations, warehouses, and hierarchical storage positions.
 * Partner-style sites (e.g. Samarkand) use branch_type `partner_point`.
 */

export const TABLE_BRANCHES = "branches" as const;
export const TABLE_LOCATIONS = "locations" as const;
export const TABLE_WAREHOUSES = "warehouses" as const;
export const TABLE_WAREHOUSE_POSITIONS = "warehouse_positions" as const;

export type BranchType =
  | "office"
  | "showroom"
  | "warehouse_branch"
  | "partner_point"
  | "mixed";

export type LocationType =
  | "office"
  | "warehouse"
  | "showroom"
  | "partner_stock_point";

export type WarehouseType = "main" | "secondary" | "partner" | "temporary";

export type WarehousePositionType =
  | "zone"
  | "rack"
  | "shelf"
  | "floor_area"
  | "virtual";

export interface BranchRow {
  id: number;
  name: string;
  code: string;
  branch_type: BranchType;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  city: string | null;
  country: string | null;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationRow {
  id: number;
  branch_id: number;
  name: string;
  code: string;
  location_type: LocationType;
  address_text: string | null;
  city: string | null;
  country: string | null;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseRow {
  id: number;
  location_id: number;
  name: string;
  code: string;
  warehouse_type: WarehouseType;
  is_external: number;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehousePositionRow {
  id: number;
  warehouse_id: number;
  name: string;
  code: string;
  position_type: WarehousePositionType;
  /** Parent row for hierarchy; null for roots. */
  parent_position_id: number | null;
  sort_order: number;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
