import { TABLE_LOCATIONS, type WarehouseRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseWarehouseCreate } from "../validation/warehouses";

export async function handleWarehouses(request: Request, env: Env): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM warehouses ORDER BY id ASC")
      .all<WarehouseRow>();
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
  const input = parseWarehouseCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const locOk = await rowExists(db, TABLE_LOCATIONS, input.location_id);
  if (!locOk) {
    return badRequest(`location_id ${input.location_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO warehouses (
          location_id, name, code, warehouse_type, is_external, is_active, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.location_id,
        input.name,
        input.code,
        input.warehouse_type,
        input.is_external,
        input.is_active,
        input.notes
      )
      .first<WarehouseRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
