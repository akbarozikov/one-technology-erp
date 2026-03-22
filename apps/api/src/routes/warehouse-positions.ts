import { TABLE_WAREHOUSES, type WarehousePositionRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseWarehousePositionCreate } from "../validation/warehouse-positions";

export async function handleWarehousePositions(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM warehouse_positions ORDER BY warehouse_id ASC, sort_order ASC, id ASC")
      .all<WarehousePositionRow>();
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
  const input = parseWarehousePositionCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const whOk = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
  if (!whOk) {
    return badRequest(`warehouse_id ${input.warehouse_id} not found`);
  }

  if (input.parent_position_id !== null) {
    const parent = await db
      .prepare(
        `SELECT id, warehouse_id FROM warehouse_positions WHERE id = ? LIMIT 1`
      )
      .bind(input.parent_position_id)
      .first<{ id: number; warehouse_id: number }>();
    if (!parent) {
      return badRequest(`parent_position_id ${input.parent_position_id} not found`);
    }
    if (parent.warehouse_id !== input.warehouse_id) {
      return badRequest("parent_position_id must belong to the same warehouse_id");
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO warehouse_positions (
          warehouse_id, name, code, position_type, parent_position_id, sort_order, is_active, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.warehouse_id,
        input.name,
        input.code,
        input.position_type,
        input.parent_position_id,
        input.sort_order,
        input.is_active,
        input.notes
      )
      .first<WarehousePositionRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
