import {
  TABLE_BRANCHES,
  TABLE_DEPARTMENTS,
  TABLE_LOCATIONS,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  TABLE_WAREHOUSE_POSITIONS,
} from "@one-technology/db";

type AllowedTable =
  | typeof TABLE_USERS
  | typeof TABLE_DEPARTMENTS
  | typeof TABLE_BRANCHES
  | typeof TABLE_LOCATIONS
  | typeof TABLE_WAREHOUSES
  | typeof TABLE_WAREHOUSE_POSITIONS;

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
