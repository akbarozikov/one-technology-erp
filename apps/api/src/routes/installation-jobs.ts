import {
  TABLE_ORDER_LINES,
  TABLE_ORDERS,
  TABLE_USERS,
  type InstallationJobRow,
  type InstallationResultRow,
  type OrderLineRow,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseInstallationJobCompletion,
  parseInstallationJobCreate,
  type InstallationJobCompletionInput,
} from "../validation/installation-jobs";

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

export async function handleInstallationJobAction(
  request: Request,
  env: Env,
  installationJobId: number,
  action: "mark-completed"
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  if (action !== "mark-completed") {
    return notFound();
  }

  const db = getDb(env);
  const job = await db
    .prepare("SELECT * FROM installation_jobs WHERE id = ? LIMIT 1")
    .bind(installationJobId)
    .first<InstallationJobRow>();

  if (!job) {
    return notFound(`installation_job ${installationJobId} not found`);
  }

  if (job.job_status === "completed") {
    return badRequest(`Installation job ${installationJobId} is already completed`);
  }
  if (job.job_status === "cancelled") {
    return badRequest(`Installation job ${installationJobId} is cancelled and cannot be completed`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseInstallationJobCompletion(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const actionContext = await validateInstallationJobCompletionContext(
    db,
    job,
    input
  );
  if (typeof actionContext === "string") {
    return badRequest(actionContext);
  }

  const completedAt =
    input.actual_completed_at ??
    actionContext.result?.completion_date ??
    job.actual_completed_at ??
    null;

  try {
    const updatedJob = await db
      .prepare(
        `UPDATE installation_jobs
         SET job_status = 'completed',
             completed_by_user_id = COALESCE(?, completed_by_user_id),
             actual_completed_at = COALESCE(?, ?, actual_completed_at, datetime('now')),
             notes = COALESCE(?, notes),
             updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(
        input.completed_by_user_id,
        input.actual_completed_at,
        actionContext.result?.completion_date ?? null,
        input.notes,
        installationJobId
      )
      .first<InstallationJobRow>();

    if (!updatedJob) {
      return notFound(`installation_job ${installationJobId} not found`);
    }

    let updatedOrderLine: OrderLineRow | null = null;
    if (actionContext.orderLine) {
      updatedOrderLine = await db
        .prepare(
          `UPDATE order_lines
           SET fulfillment_status = 'installed',
               primary_installation_job_id = COALESCE(?, primary_installation_job_id),
               fulfilled_at = COALESCE(?, fulfilled_at, datetime('now')),
               updated_at = datetime('now')
           WHERE id = ?
           RETURNING *`
        )
        .bind(
          installationJobId,
          completedAt,
          actionContext.orderLine.id
        )
        .first<OrderLineRow>();
    }

    let updatedReservation: StockReservationRow | null = null;
    if (actionContext.reservation) {
      updatedReservation = await db
        .prepare(
          `UPDATE stock_reservations
           SET status = 'consumed',
               consumed_installation_job_id = COALESCE(?, consumed_installation_job_id),
               consumed_at = COALESCE(?, consumed_at, datetime('now')),
               updated_at = datetime('now')
           WHERE id = ?
           RETURNING *`
        )
        .bind(
          installationJobId,
          completedAt,
          actionContext.reservation.id
        )
        .first<StockReservationRow>();
    }

    return jsonOk({
      data: {
        installation_job: updatedJob,
        installation_result: actionContext.result,
        order_line: updatedOrderLine,
        stock_reservation: updatedReservation,
      },
    });
  } catch (err) {
    return asSqlFailure(err);
  }
}

async function validateInstallationJobCompletionContext(
  db: D1Database,
  job: InstallationJobRow,
  input: InstallationJobCompletionInput
): Promise<
  | string
  | {
      result: InstallationResultRow | null;
      orderLine: OrderLineRow | null;
      reservation: StockReservationRow | null;
    }
> {
  if (input.completed_by_user_id !== null) {
    const userOk = await rowExists(db, TABLE_USERS, input.completed_by_user_id);
    if (!userOk) {
      return `completed_by_user_id ${input.completed_by_user_id} not found`;
    }
  }

  let result: InstallationResultRow | null = null;
  if (input.installation_result_id !== null) {
    result = await db
      .prepare("SELECT * FROM installation_results WHERE id = ? LIMIT 1")
      .bind(input.installation_result_id)
      .first<InstallationResultRow>();
    if (!result) {
      return `installation_result_id ${input.installation_result_id} not found`;
    }
    if (result.installation_job_id !== job.id) {
      return `installation_result_id ${input.installation_result_id} does not belong to installation_job ${job.id}`;
    }
  }

  let orderLine: OrderLineRow | null = null;
  if (input.order_line_id !== null) {
    orderLine = await db
      .prepare("SELECT * FROM order_lines WHERE id = ? LIMIT 1")
      .bind(input.order_line_id)
      .first<OrderLineRow>();
    if (!orderLine) {
      return `order_line_id ${input.order_line_id} not found`;
    }
    if (orderLine.fulfillment_status === "cancelled") {
      return `order_line_id ${input.order_line_id} is cancelled and cannot be marked installed`;
    }
  }

  let reservation: StockReservationRow | null = null;
  if (input.reservation_id !== null) {
    reservation = await db
      .prepare("SELECT * FROM stock_reservations WHERE id = ? LIMIT 1")
      .bind(input.reservation_id)
      .first<StockReservationRow>();
    if (!reservation) {
      return `reservation_id ${input.reservation_id} not found`;
    }
    if (reservation.status === "cancelled") {
      return `reservation_id ${input.reservation_id} is cancelled and cannot be consumed by installation completion`;
    }
    if (reservation.status === "released") {
      return `reservation_id ${input.reservation_id} is released and cannot be consumed by installation completion`;
    }
  }

  return {
    result,
    orderLine,
    reservation,
  };
}
