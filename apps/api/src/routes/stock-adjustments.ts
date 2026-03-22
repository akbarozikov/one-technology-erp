import {
  TABLE_USERS,
  TABLE_WAREHOUSES,
  type StockAdjustmentRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockAdjustmentCreate } from "../validation/stock-adjustments";

export async function handleStockAdjustments(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM stock_adjustments ORDER BY adjustment_date DESC, id DESC")
      .all<StockAdjustmentRow>();
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
  const input = parseStockAdjustmentCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const warehouseOk = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
  if (!warehouseOk) {
    return badRequest(`warehouse_id ${input.warehouse_id} not found`);
  }
  if (input.performed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.performed_by_user_id);
    if (!ok) {
      return badRequest(`performed_by_user_id ${input.performed_by_user_id} not found`);
    }
  }
  if (input.approved_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.approved_by_user_id);
    if (!ok) {
      return badRequest(`approved_by_user_id ${input.approved_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_adjustments (
          reference_code, warehouse_id, adjustment_date, reason, status,
          performed_by_user_id, approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.reference_code,
        input.warehouse_id,
        input.adjustment_date,
        input.reason,
        input.status,
        input.performed_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<StockAdjustmentRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
