import {
  TABLE_BOM_LINES,
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_USERS,
  type BomChangeLogRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseBomChangeLogCreate } from "../validation/bom-change-logs";

export async function handleBomChangeLogs(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM bom_change_logs ORDER BY created_at DESC, id DESC")
      .all<BomChangeLogRow>();
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
  const input = parseBomChangeLogCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const variantOk = await rowExists(db, TABLE_DOOR_CONFIGURATION_VARIANTS, input.variant_id);
  if (!variantOk) {
    return badRequest(`variant_id ${input.variant_id} not found`);
  }

  if (input.bom_line_id !== null) {
    const ok = await rowExists(db, TABLE_BOM_LINES, input.bom_line_id);
    if (!ok) {
      return badRequest(`bom_line_id ${input.bom_line_id} not found`);
    }
  }

  if (input.changed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.changed_by_user_id);
    if (!ok) {
      return badRequest(`changed_by_user_id ${input.changed_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO bom_change_logs (
          variant_id, bom_line_id, change_type, old_values_json,
          new_values_json, reason, changed_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.variant_id,
        input.bom_line_id,
        input.change_type,
        input.old_values_json,
        input.new_values_json,
        input.reason,
        input.changed_by_user_id
      )
      .first<BomChangeLogRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
