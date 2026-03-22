import {
  TABLE_INVENTORY_COUNTS,
  TABLE_PRODUCTS,
  TABLE_UNITS_OF_MEASURE,
  TABLE_WAREHOUSE_POSITIONS,
  type InventoryCountLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseInventoryCountLineCreate } from "../validation/inventory-count-lines";

export async function handleInventoryCountLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM inventory_count_lines ORDER BY inventory_count_id DESC, id DESC"
      )
      .all<InventoryCountLineRow>();
    return jsonOk({ data: results ?? [] });
  }

  if (request.method !== "POST") {
    return methodNotAllowed(["GET", "POST"]);
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseInventoryCountLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const countOk = await rowExists(db, TABLE_INVENTORY_COUNTS, input.inventory_count_id);
  if (!countOk) {
    return badRequest(`inventory_count_id ${input.inventory_count_id} not found`);
  }
  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }
  const positionOk = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.position_id);
  if (!positionOk) {
    return badRequest(`position_id ${input.position_id} not found`);
  }
  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO inventory_count_lines (
          inventory_count_id, product_id, position_id, system_qty,
          counted_qty, difference_qty, unit_id, line_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.inventory_count_id,
        input.product_id,
        input.position_id,
        input.system_qty,
        input.counted_qty,
        input.difference_qty,
        input.unit_id,
        input.line_notes
      )
      .first<InventoryCountLineRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
