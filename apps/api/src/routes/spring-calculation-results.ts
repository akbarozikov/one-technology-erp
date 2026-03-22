import {
  TABLE_CALCULATION_RUNS,
  type SpringCalculationResultRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseSpringCalculationResultCreate } from "../validation/spring-calculation-results";

export async function handleSpringCalculationResults(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM spring_calculation_results ORDER BY calculation_run_id DESC, id DESC"
      )
      .all<SpringCalculationResultRow>();
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
  const input = parseSpringCalculationResultCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const runOk = await rowExists(db, TABLE_CALCULATION_RUNS, input.calculation_run_id);
  if (!runOk) {
    return badRequest(`calculation_run_id ${input.calculation_run_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO spring_calculation_results (
          calculation_run_id, spring_system_type, spring_count, wire_size,
          inner_diameter, spring_length, torque_value, cycle_rating,
          safety_factor, result_status, warning_text, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.calculation_run_id,
        input.spring_system_type,
        input.spring_count,
        input.wire_size,
        input.inner_diameter,
        input.spring_length,
        input.torque_value,
        input.cycle_rating,
        input.safety_factor,
        input.result_status,
        input.warning_text,
        input.notes
      )
      .first<SpringCalculationResultRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
