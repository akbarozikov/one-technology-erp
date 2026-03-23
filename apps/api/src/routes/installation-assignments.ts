import {
  TABLE_EMPLOYEES,
  TABLE_INSTALLATION_JOBS,
  type InstallationAssignmentRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseInstallationAssignmentCreate } from "../validation/installation-assignments";

export async function handleInstallationAssignments(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM installation_assignments ORDER BY installation_job_id DESC, id DESC")
      .all<InstallationAssignmentRow>();
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
  const input = parseInstallationAssignmentCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const jobOk = await rowExists(db, TABLE_INSTALLATION_JOBS, input.installation_job_id);
  if (!jobOk) {
    return badRequest(`installation_job_id ${input.installation_job_id} not found`);
  }

  const employeeOk = await rowExists(db, TABLE_EMPLOYEES, input.employee_id);
  if (!employeeOk) {
    return badRequest(`employee_id ${input.employee_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO installation_assignments (
          installation_job_id, employee_id, assignment_role, assigned_at, notes
        ) VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?) RETURNING *`
      )
      .bind(
        input.installation_job_id,
        input.employee_id,
        input.assignment_role,
        input.assigned_at,
        input.notes
      )
      .first<InstallationAssignmentRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
