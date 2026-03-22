import {
  TABLE_PRODUCTS,
  TABLE_STOCK_MOVEMENTS,
  TABLE_UNITS_OF_MEASURE,
  TABLE_WAREHOUSE_POSITIONS,
  type StockMovementLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockMovementLineCreate } from "../validation/stock-movement-lines";

export async function handleStockMovementLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM stock_movement_lines ORDER BY stock_movement_id DESC, id DESC"
      )
      .all<StockMovementLineRow>();
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
  const input = parseStockMovementLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.from_position_id === null && input.to_position_id === null) {
    return badRequest("At least one of from_position_id or to_position_id is required");
  }

  const movementOk = await rowExists(db, TABLE_STOCK_MOVEMENTS, input.stock_movement_id);
  if (!movementOk) {
    return badRequest(`stock_movement_id ${input.stock_movement_id} not found`);
  }

  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }

  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  if (input.from_position_id !== null) {
    const ok = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.from_position_id);
    if (!ok) {
      return badRequest(`from_position_id ${input.from_position_id} not found`);
    }
  }

  if (input.to_position_id !== null) {
    const ok = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.to_position_id);
    if (!ok) {
      return badRequest(`to_position_id ${input.to_position_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_movement_lines (
          stock_movement_id, product_id, from_position_id, to_position_id,
          quantity, unit_id, unit_cost, line_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.stock_movement_id,
        input.product_id,
        input.from_position_id,
        input.to_position_id,
        input.quantity,
        input.unit_id,
        input.unit_cost,
        input.line_notes
      )
      .first<StockMovementLineRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
