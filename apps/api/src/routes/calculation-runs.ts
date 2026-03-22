import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_USERS,
  type CalculationRunRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseCalculationRunCreate } from "../validation/calculation-runs";

export async function handleCalculationRuns(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM calculation_runs ORDER BY executed_at DESC, id DESC")
      .all<CalculationRunRow>();
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
  const input = parseCalculationRunCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const variantOk = await rowExists(db, TABLE_DOOR_CONFIGURATION_VARIANTS, input.variant_id);
  if (!variantOk) {
    return badRequest(`variant_id ${input.variant_id} not found`);
  }

  if (input.executed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.executed_by_user_id);
    if (!ok) {
      return badRequest(`executed_by_user_id ${input.executed_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO calculation_runs (
          variant_id, run_type, run_status, input_snapshot_json,
          output_snapshot_json, warnings_json, errors_json,
          executed_by_user_id, executed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now'))) RETURNING *`
      )
      .bind(
        input.variant_id,
        input.run_type,
        input.run_status,
        input.input_snapshot_json,
        input.output_snapshot_json,
        input.warnings_json,
        input.errors_json,
        input.executed_by_user_id,
        input.executed_at
      )
      .first<CalculationRunRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
