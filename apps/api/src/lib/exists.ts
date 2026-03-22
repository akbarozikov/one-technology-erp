import {
  TABLE_BRANCHES,
  TABLE_DEPARTMENTS,
  TABLE_LOCATIONS,
  TABLE_PERMISSIONS,
  TABLE_PRODUCT_ATTRIBUTES,
  TABLE_PRODUCT_BUNDLES,
  TABLE_PRODUCT_CATEGORIES,
  TABLE_PRODUCTS,
  TABLE_ROLES,
  TABLE_STOCK_BALANCES,
  TABLE_STOCK_MOVEMENT_LINES,
  TABLE_STOCK_MOVEMENTS,
  TABLE_SUPPLIERS,
  TABLE_UNITS_OF_MEASURE,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  TABLE_WAREHOUSE_POSITIONS,
} from "@one-technology/db";

type AllowedTable =
  | typeof TABLE_USERS
  | typeof TABLE_ROLES
  | typeof TABLE_PERMISSIONS
  | typeof TABLE_DEPARTMENTS
  | typeof TABLE_BRANCHES
  | typeof TABLE_LOCATIONS
  | typeof TABLE_WAREHOUSES
  | typeof TABLE_WAREHOUSE_POSITIONS
  | typeof TABLE_PRODUCT_CATEGORIES
  | typeof TABLE_UNITS_OF_MEASURE
  | typeof TABLE_SUPPLIERS
  | typeof TABLE_PRODUCTS
  | typeof TABLE_PRODUCT_ATTRIBUTES
  | typeof TABLE_PRODUCT_BUNDLES
  | typeof TABLE_STOCK_BALANCES
  | typeof TABLE_STOCK_MOVEMENTS
  | typeof TABLE_STOCK_MOVEMENT_LINES;

export async function rowExists(
  db: D1Database,
  table: AllowedTable,
  id: number
): Promise<boolean> {
  const row = await db
    .prepare(`SELECT 1 AS ok FROM ${table} WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<{ ok: number }>();
  return !!row;
}
