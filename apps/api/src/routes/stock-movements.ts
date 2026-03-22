import {
  TABLE_USERS,
  TABLE_WAREHOUSES,
  type StockMovementRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockMovementCreate } from "../validation/stock-movements";

export async function handleStockMovements(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM stock_movements ORDER BY movement_date DESC, id DESC"
      )
      .all<StockMovementRow>();
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
  const input = parseStockMovementCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.warehouse_id !== null) {
    const ok = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
    if (!ok) {
      return badRequest(`warehouse_id ${input.warehouse_id} not found`);
    }
  }
  if (input.source_warehouse_id !== null) {
    const ok = await rowExists(db, TABLE_WAREHOUSES, input.source_warehouse_id);
    if (!ok) {
      return badRequest(
        `source_warehouse_id ${input.source_warehouse_id} not found`
      );
    }
  }
  if (input.destination_warehouse_id !== null) {
    const ok = await rowExists(db, TABLE_WAREHOUSES, input.destination_warehouse_id);
    if (!ok) {
      return badRequest(
        `destination_warehouse_id ${input.destination_warehouse_id} not found`
      );
    }
  }
  if (input.performed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.performed_by_user_id);
    if (!ok) {
      return badRequest(
        `performed_by_user_id ${input.performed_by_user_id} not found`
      );
    }
  }
  if (input.approved_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.approved_by_user_id);
    if (!ok) {
      return badRequest(
        `approved_by_user_id ${input.approved_by_user_id} not found`
      );
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_movements (
          movement_type, reference_code, warehouse_id, source_warehouse_id,
          destination_warehouse_id, related_entity_type, related_entity_id,
          status, movement_date, performed_by_user_id, approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.movement_type,
        input.reference_code,
        input.warehouse_id,
        input.source_warehouse_id,
        input.destination_warehouse_id,
        input.related_entity_type,
        input.related_entity_id,
        input.status,
        input.movement_date,
        input.performed_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<StockMovementRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
