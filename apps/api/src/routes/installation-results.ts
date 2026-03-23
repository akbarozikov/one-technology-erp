import {
  TABLE_INSTALLATION_JOBS,
  TABLE_USERS,
  type InstallationResultRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseInstallationResultCreate } from "../validation/installation-results";

export async function handleInstallationResults(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM installation_results ORDER BY completion_date DESC, id DESC")
      .all<InstallationResultRow>();
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
  const input = parseInstallationResultCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const jobOk = await rowExists(db, TABLE_INSTALLATION_JOBS, input.installation_job_id);
  if (!jobOk) {
    return badRequest(`installation_job_id ${input.installation_job_id} not found`);
  }

  if (input.created_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!ok) {
      return badRequest(`created_by_user_id ${input.created_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO installation_results (
          installation_job_id, result_status, completion_date, work_summary,
          issues_found, materials_used_notes, customer_feedback,
          customer_signoff_text, followup_required, followup_notes,
          created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.installation_job_id,
        input.result_status,
        input.completion_date,
        input.work_summary,
        input.issues_found,
        input.materials_used_notes,
        input.customer_feedback,
        input.customer_signoff_text,
        input.followup_required,
        input.followup_notes,
        input.created_by_user_id
      )
      .first<InstallationResultRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
