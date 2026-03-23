import {
  TABLE_DOCUMENT_TEMPLATES,
  TABLE_INSTALLATION_RESULTS,
  TABLE_USERS,
  TABLE_ORDER_LINES,
  TABLE_ORDERS,
  type DocumentTemplateRow,
  type GeneratedDocumentRow,
  type InstallationJobRow,
  type InstallationResultRow,
  type OrderLineRow,
  type OrderRow,
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
  parseInstallationJobCreateResultDraft,
  parseInstallationJobGenerateDocument,
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
  action: "mark-completed" | "generate-document" | "create-result-draft"
): Promise<Response> {
  if (action === "generate-document") {
    return handleGenerateInstallationDocument(request, env, installationJobId);
  }

  if (action === "create-result-draft") {
    return handleCreateInstallationResultDraft(request, env, installationJobId);
  }

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

async function handleCreateInstallationResultDraft(
  request: Request,
  env: Env,
  installationJobId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const job = await db
    .prepare("SELECT * FROM installation_jobs WHERE id = ? LIMIT 1")
    .bind(installationJobId)
    .first<InstallationJobRow>();

  if (!job) {
    return notFound(`installation_job ${installationJobId} not found`);
  }

  if (job.job_status === "cancelled") {
    return badRequest(
      `installation_job ${installationJobId} is cancelled and cannot create a result draft`
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseInstallationJobCreateResultDraft(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
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
        ) VALUES (?, ?, COALESCE(?, datetime('now')), ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        job.id,
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

    if (!row) {
      return badRequest("Insert did not return a row");
    }

    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}

async function handleGenerateInstallationDocument(
  request: Request,
  env: Env,
  installationJobId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const job = await db
    .prepare("SELECT * FROM installation_jobs WHERE id = ? LIMIT 1")
    .bind(installationJobId)
    .first<InstallationJobRow>();

  if (!job) {
    return notFound(`installation_job ${installationJobId} not found`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseInstallationJobGenerateDocument(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const templateOk = await rowExists(db, TABLE_DOCUMENT_TEMPLATES, input.template_id);
  if (!templateOk) {
    return badRequest(`template_id ${input.template_id} not found`);
  }

  if (input.generated_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.generated_by_user_id);
    if (!ok) {
      return badRequest(`generated_by_user_id ${input.generated_by_user_id} not found`);
    }
  }

  const template = await db
    .prepare("SELECT * FROM document_templates WHERE id = ? LIMIT 1")
    .bind(input.template_id)
    .first<DocumentTemplateRow>();

  if (!template) {
    return notFound(`document_template ${input.template_id} not found`);
  }

  if (template.is_active !== 1) {
    return badRequest(`document_template ${template.id} is not active`);
  }

  if (template.template_type !== "installation" && template.template_type !== "service") {
    return badRequest(
      `document_template ${template.id} must have template_type installation or service`
    );
  }

  if (template.entity_type !== "installation_job") {
    return badRequest(
      `document_template ${template.id} must have entity_type installation_job`
    );
  }

  let installationResult: InstallationResultRow | null = null;
  if (input.installation_result_id !== null) {
    installationResult = await db
      .prepare("SELECT * FROM installation_results WHERE id = ? LIMIT 1")
      .bind(input.installation_result_id)
      .first<InstallationResultRow>();
    if (!installationResult) {
      return badRequest(`installation_result_id ${input.installation_result_id} not found`);
    }
    if (installationResult.installation_job_id !== job.id) {
      return badRequest(
        `installation_result_id ${input.installation_result_id} does not belong to installation_job ${job.id}`
      );
    }
  }

  const order =
    job.order_id === null
      ? null
      : await db
          .prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
          .bind(job.order_id)
          .first<OrderRow>();

  const orderLine =
    job.order_line_id === null
      ? null
      : await db
          .prepare("SELECT * FROM order_lines WHERE id = ? LIMIT 1")
          .bind(job.order_line_id)
          .first<OrderLineRow>();

  const documentNumber = buildInstallationDocumentNumber(job, input.document_number);
  const title =
    input.title ??
    `${job.job_type === "service" ? "Service" : "Installation"} Document ${job.job_number}`;
  const renderedContent = buildInstallationDocumentHtml(
    template,
    job,
    installationResult,
    order,
    orderLine,
    title,
    documentNumber
  );

  try {
    await db.exec("BEGIN TRANSACTION");

    const generatedDocument = await db
      .prepare(
        `INSERT INTO generated_documents (
          template_id, document_number, title, entity_type, entity_id,
          generation_status, rendered_content, file_url, file_name,
          mime_type, generated_by_user_id, generated_at
        ) VALUES (?, ?, ?, 'installation_job', ?, 'generated', ?, NULL, NULL, ?, ?, datetime('now')) RETURNING *`
      )
      .bind(
        input.template_id,
        documentNumber,
        title,
        job.id,
        renderedContent,
        "text/html",
        input.generated_by_user_id
      )
      .first<GeneratedDocumentRow>();

    if (!generatedDocument) {
      throw new Error("Insert did not return a generated document row");
    }

    if (input.create_job_link === 1) {
      await db
        .prepare(
          `INSERT INTO document_links (
            generated_document_id, entity_type, entity_id, link_role
          ) VALUES (?, 'installation_job', ?, 'primary')`
        )
        .bind(generatedDocument.id, job.id)
        .run();
    }

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          generated_document: generatedDocument,
          linked_installation_job: input.create_job_link === 1,
          installation_result_id: installationResult?.id ?? null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore rollback errors and preserve the original failure.
    }
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

function buildInstallationDocumentNumber(
  job: InstallationJobRow,
  requestedDocumentNumber: string | null
): string {
  if (requestedDocumentNumber) {
    return requestedDocumentNumber;
  }

  return `${job.job_number}-DOC`;
}

function buildInstallationDocumentHtml(
  template: DocumentTemplateRow,
  job: InstallationJobRow,
  installationResult: InstallationResultRow | null,
  order: OrderRow | null,
  orderLine: OrderLineRow | null,
  title: string,
  documentNumber: string
): string {
  const orderBlock = order
    ? `<div>Order Number: ${escapeHtml(order.order_number)}</div>`
    : "";
  const orderLineBlock = orderLine
    ? `<div>Order Line: ${orderLine.line_number}</div>`
    : "";
  const jobNotesBlock = job.notes
    ? `<section><h2>Job Notes</h2><p>${escapeHtml(job.notes)}</p></section>`
    : "";
  const resultBlock = installationResult
    ? `<section>
        <h2>Result</h2>
        <div>Result Status: ${escapeHtml(installationResult.result_status)}</div>
        <div>Completion Date: ${installationResult.completion_date ? escapeHtml(installationResult.completion_date) : "-"}</div>
        <div>Work Summary: ${installationResult.work_summary ? escapeHtml(installationResult.work_summary) : "-"}</div>
        <div>Issues Found: ${installationResult.issues_found ? escapeHtml(installationResult.issues_found) : "-"}</div>
        <div>Materials Used: ${installationResult.materials_used_notes ? escapeHtml(installationResult.materials_used_notes) : "-"}</div>
        <div>Customer Feedback: ${installationResult.customer_feedback ? escapeHtml(installationResult.customer_feedback) : "-"}</div>
        <div>Customer Signoff: ${installationResult.customer_signoff_text ? escapeHtml(installationResult.customer_signoff_text) : "-"}</div>
        <div>Followup Required: ${installationResult.followup_required === 1 ? "Yes" : "No"}</div>
        <div>Followup Notes: ${installationResult.followup_notes ? escapeHtml(installationResult.followup_notes) : "-"}</div>
      </section>`
    : "";
  const templateHint = template.template_content
    ? `<section><h2>Template Notes</h2><div>${escapeHtml(template.template_content)}</div></section>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <header>
      <div>Document Number: ${escapeHtml(documentNumber)}</div>
      <div>Template: ${escapeHtml(template.name)} (${escapeHtml(template.code)})</div>
      <h1>${escapeHtml(title)}</h1>
      <p>Installation/service document generated from installation job context.</p>
    </header>

    <section>
      <h2>Job Metadata</h2>
      <div>Job Number: ${escapeHtml(job.job_number)}</div>
      <div>Job Type: ${escapeHtml(job.job_type)}</div>
      <div>Job Status: ${escapeHtml(job.job_status)}</div>
      <div>Planned Date: ${job.planned_date ? escapeHtml(job.planned_date) : "-"}</div>
      <div>Actual Completed At: ${job.actual_completed_at ? escapeHtml(job.actual_completed_at) : "-"}</div>
    </section>

    <section>
      <h2>Address & Contact</h2>
      <div>Address: ${job.address_text ? escapeHtml(job.address_text) : "-"}</div>
      <div>City: ${job.city ? escapeHtml(job.city) : "-"}</div>
      <div>Contact Name: ${job.contact_name ? escapeHtml(job.contact_name) : "-"}</div>
      <div>Contact Phone: ${job.contact_phone ? escapeHtml(job.contact_phone) : "-"}</div>
    </section>

    ${(orderBlock || orderLineBlock) ? `<section><h2>Linked Commercial Context</h2>${orderBlock}${orderLineBlock}</section>` : ""}

    ${resultBlock}
    ${jobNotesBlock}
    ${templateHint}
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
