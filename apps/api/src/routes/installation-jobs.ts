import {
  TABLE_INSTALLATION_JOBS,
  TABLE_ORDER_LINES,
  TABLE_ORDERS,
  TABLE_USERS,
  type InstallationJobRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseInstallationJobCreate } from "../validation/installation-jobs";

export async function handleInstallationJobs(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM installation_jobs ORDER BY planned_date DESC, id DESC")
      .all<InstallationJobRow>();
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
  const input = parseInstallationJobCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.order_id !== null) {
    const ok = await rowExists(db, TABLE_ORDERS, input.order_id);
    if (!ok) {
      return badRequest(`order_id ${input.order_id} not found`);
    }
  }

  if (input.order_line_id !== null) {
    const ok = await rowExists(db, TABLE_ORDER_LINES, input.order_line_id);
    if (!ok) {
      return badRequest(`order_line_id ${input.order_line_id} not found`);
    }
  }

  if (input.created_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!ok) {
      return badRequest(`created_by_user_id ${input.created_by_user_id} not found`);
    }
  }

  if (input.approved_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.approved_by_user_id);
    if (!ok) {
      return badRequest(`approved_by_user_id ${input.approved_by_user_id} not found`);
    }
  }

  if (input.completed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.completed_by_user_id);
    if (!ok) {
      return badRequest(`completed_by_user_id ${input.completed_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO installation_jobs (
          order_id, order_line_id, job_number, job_type, job_status,
          planned_date, scheduled_time_from, scheduled_time_to,
          actual_started_at, actual_completed_at, address_text, city,
          contact_name, contact_phone, notes, created_by_user_id,
          approved_by_user_id, completed_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.order_id,
        input.order_line_id,
        input.job_number,
        input.job_type,
        input.job_status,
        input.planned_date,
        input.scheduled_time_from,
        input.scheduled_time_to,
        input.actual_started_at,
        input.actual_completed_at,
        input.address_text,
        input.city,
        input.contact_name,
        input.contact_phone,
        input.notes,
        input.created_by_user_id,
        input.approved_by_user_id,
        input.completed_by_user_id
      )
      .first<InstallationJobRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
