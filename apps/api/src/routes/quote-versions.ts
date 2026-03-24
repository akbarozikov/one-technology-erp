import {
  TABLE_DOCUMENT_LINKS,
  TABLE_DOCUMENT_TEMPLATES,
  TABLE_GENERATED_DOCUMENTS,
  TABLE_ORDERS,
  TABLE_QUOTE_DISCOUNTS,
  TABLE_QUOTE_LINES,
  TABLE_QUOTES,
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type DocumentTemplateRow,
  type GeneratedDocumentRow,
  type OrderRow,
  type QuoteDiscountRow,
  type QuoteLineRow,
  type QuoteRow,
  type QuoteVersionRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseQuoteVersionCreate,
  parseQuoteVersionCreateOrderDraft,
  parseQuoteVersionGenerateDocument,
} from "../validation/quote-versions";

export async function handleQuoteVersions(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM quote_versions ORDER BY quote_id DESC, version_number DESC, id DESC"
      )
      .all<QuoteVersionRow>();
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
  const input = parseQuoteVersionCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const quoteOk = await rowExists(db, TABLE_QUOTES, input.quote_id);
  if (!quoteOk) {
    return badRequest(`quote_id ${input.quote_id} not found`);
  }

  if (input.based_on_version_id !== null) {
    const ok = await rowExists(db, TABLE_QUOTE_VERSIONS, input.based_on_version_id);
    if (!ok) {
      return badRequest(`based_on_version_id ${input.based_on_version_id} not found`);
    }
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
        `INSERT INTO quote_versions (
          quote_id, version_number, version_status, is_current,
          based_on_version_id, minimum_sale_total, actual_sale_total,
          discount_total, grand_total, reservation_status, notes,
          created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.quote_id,
        input.version_number,
        input.version_status,
        input.is_current,
        input.based_on_version_id,
        input.minimum_sale_total,
        input.actual_sale_total,
        input.discount_total,
        input.grand_total,
        input.reservation_status,
        input.notes,
        input.created_by_user_id
      )
      .first<QuoteVersionRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}

export async function handleQuoteVersionAction(
  request: Request,
  env: Env,
  quoteVersionId: number,
  action: "create-order-draft" | "generate-document"
): Promise<Response> {
  if (action === "create-order-draft") {
    return handleCreateOrderDraft(request, env, quoteVersionId);
  }

  if (action === "generate-document") {
    return handleGenerateDocument(request, env, quoteVersionId);
  }

  return notFound();
}

async function handleCreateOrderDraft(
  request: Request,
  env: Env,
  quoteVersionId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const quoteVersion = await db
    .prepare("SELECT * FROM quote_versions WHERE id = ? LIMIT 1")
    .bind(quoteVersionId)
    .first<QuoteVersionRow>();

  if (!quoteVersion) {
    return notFound(`quote_version ${quoteVersionId} not found`);
  }

  const quote = await db
    .prepare("SELECT * FROM quotes WHERE id = ? LIMIT 1")
    .bind(quoteVersion.quote_id)
    .first<QuoteRow>();

  if (!quote) {
    return notFound(`quote ${quoteVersion.quote_id} not found`);
  }

  if (
    quoteVersion.version_status === "rejected" ||
    quoteVersion.version_status === "superseded" ||
    quoteVersion.version_status === "cancelled"
  ) {
    return badRequest(
      `quote_version ${quoteVersionId} with status ${quoteVersion.version_status} cannot create an order draft`
    );
  }

  if (
    quote.status === "rejected" ||
    quote.status === "expired" ||
    quote.status === "cancelled"
  ) {
    return badRequest(
      `quote ${quote.id} with status ${quote.status} cannot create an order draft`
    );
  }

  const existingOrder = await db
    .prepare("SELECT * FROM orders WHERE quote_version_id = ? LIMIT 1")
    .bind(quoteVersionId)
    .first<OrderRow>();
  if (existingOrder) {
    return badRequest(
      `Order ${existingOrder.id} already exists for quote_version ${quoteVersionId}`
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseQuoteVersionCreateOrderDraft(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
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

  const { results: quoteLines } = await db
    .prepare(
      "SELECT * FROM quote_lines WHERE quote_version_id = ? ORDER BY line_number ASC, id ASC"
    )
    .bind(quoteVersionId)
    .all<QuoteLineRow>();
  const { results: quoteDiscounts } = await db
    .prepare(
      "SELECT * FROM quote_discounts WHERE quote_version_id = ? ORDER BY id ASC"
    )
    .bind(quoteVersionId)
    .all<QuoteDiscountRow>();

  const orderNumber = buildOrderNumber(quote, quoteVersion, input.order_number);

  try {
    await db.exec("BEGIN TRANSACTION");

    const order = await db
      .prepare(
        `INSERT INTO orders (
          quote_version_id, customer_id, deal_id, order_number,
          installation_required, fulfillment_type, order_status,
          payment_status, reservation_status, currency,
          minimum_sale_total, actual_sale_total, discount_total,
          grand_total, paid_total, remaining_total, order_date,
          planned_installation_date, completed_at, created_by_user_id,
          approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, 'draft', 'unpaid', 'none', ?, ?, ?, ?, ?, 0, ?, COALESCE(?, date('now')), ?, NULL, ?, ?, ?) RETURNING *`
      )
      .bind(
        quoteVersionId,
        null,
        quote.deal_id,
        orderNumber,
        input.installation_required,
        input.fulfillment_type,
        quote.currency,
        quoteVersion.minimum_sale_total,
        quoteVersion.actual_sale_total,
        quoteVersion.discount_total,
        quoteVersion.grand_total,
        quoteVersion.grand_total ?? 0,
        input.order_date,
        input.planned_installation_date,
        input.created_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<OrderRow>();

    if (!order) {
      throw new Error("Insert did not return an order row");
    }

    await copyQuoteLinesToOrder(db, order.id, quoteLines ?? []);
    await copyQuoteDiscountsToOrder(db, order.id, quoteDiscounts ?? []);

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          order,
          copied_line_count: quoteLines?.length ?? 0,
          copied_discount_count: quoteDiscounts?.length ?? 0,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore rollback errors; preserve the original failure.
    }
    return asSqlFailure(err);
  }
}

async function handleGenerateDocument(
  request: Request,
  env: Env,
  quoteVersionId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const quoteVersion = await db
    .prepare("SELECT * FROM quote_versions WHERE id = ? LIMIT 1")
    .bind(quoteVersionId)
    .first<QuoteVersionRow>();

  if (!quoteVersion) {
    return notFound(`quote_version ${quoteVersionId} not found`);
  }

  const quote = await db
    .prepare("SELECT * FROM quotes WHERE id = ? LIMIT 1")
    .bind(quoteVersion.quote_id)
    .first<QuoteRow>();

  if (!quote) {
    return notFound(`quote ${quoteVersion.quote_id} not found`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseQuoteVersionGenerateDocument(body, errors);
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

  if (template.template_type !== "quote") {
    return badRequest(
      `document_template ${template.id} must have template_type quote`
    );
  }

  if (template.entity_type !== "quote_version") {
    return badRequest(
      `document_template ${template.id} must have entity_type quote_version`
    );
  }

  const { results: quoteLines } = await db
    .prepare(
      "SELECT * FROM quote_lines WHERE quote_version_id = ? ORDER BY line_number ASC, id ASC"
    )
    .bind(quoteVersionId)
    .all<QuoteLineRow>();
  const { results: quoteDiscounts } = await db
    .prepare(
      "SELECT * FROM quote_discounts WHERE quote_version_id = ? ORDER BY id ASC"
    )
    .bind(quoteVersionId)
    .all<QuoteDiscountRow>();

  const documentNumber = buildGeneratedDocumentNumber(
    quote,
    quoteVersion,
    input.document_number
  );
  const title =
    input.title ?? `Commercial Proposal ${quote.quote_number} / V${quoteVersion.version_number}`;
  const renderedContent = buildQuoteProposalHtml(
    template,
    quote,
    quoteVersion,
    quoteLines ?? [],
    quoteDiscounts ?? [],
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
        ) VALUES (?, ?, ?, 'quote_version', ?, 'generated', ?, NULL, NULL, ?, ?, datetime('now')) RETURNING *`
      )
      .bind(
        input.template_id,
        documentNumber,
        title,
        quoteVersion.id,
        renderedContent,
        "text/html",
        input.generated_by_user_id
      )
      .first<GeneratedDocumentRow>();

    if (!generatedDocument) {
      throw new Error("Insert did not return a generated document row");
    }

    if (input.create_quote_link === 1) {
      await db
        .prepare(
          `INSERT INTO document_links (
            generated_document_id, entity_type, entity_id, link_role
          ) VALUES (?, 'quote', ?, 'derived_from')`
        )
        .bind(generatedDocument.id, quote.id)
        .run();
    }

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          generated_document: generatedDocument,
          linked_quote: input.create_quote_link === 1,
          line_count: quoteLines?.length ?? 0,
          discount_count: quoteDiscounts?.length ?? 0,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore rollback errors; preserve the original failure.
    }
    return asSqlFailure(err);
  }
}

function buildOrderNumber(
  quote: QuoteRow,
  quoteVersion: QuoteVersionRow,
  requestedOrderNumber: string | null
): string {
  if (requestedOrderNumber) {
    return requestedOrderNumber;
  }

  return `${quote.quote_number}-V${quoteVersion.version_number}-ORD`;
}

function buildGeneratedDocumentNumber(
  quote: QuoteRow,
  quoteVersion: QuoteVersionRow,
  requestedDocumentNumber: string | null
): string {
  if (requestedDocumentNumber) {
    return requestedDocumentNumber;
  }

  return `${quote.quote_number}-V${quoteVersion.version_number}-CP`;
}

function buildQuoteProposalHtml(
  template: DocumentTemplateRow,
  quote: QuoteRow,
  quoteVersion: QuoteVersionRow,
  quoteLines: QuoteLineRow[],
  quoteDiscounts: QuoteDiscountRow[],
  title: string,
  documentNumber: string
): string {
  const lineRows = quoteLines
    .map((line) => {
      const description = line.snapshot_description
        ? `<div><strong>Description:</strong> ${escapeHtml(line.snapshot_description)}</div>`
        : "";

      return `<tr>
        <td>${line.line_number}</td>
        <td>
          <div><strong>${escapeHtml(line.snapshot_product_name)}</strong></div>
          <div>SKU: ${escapeHtml(line.snapshot_sku)}</div>
          ${description}
        </td>
        <td>${formatNumber(line.quantity)}</td>
        <td>${escapeHtml(line.snapshot_unit_name)}</td>
        <td>${formatMoney(line.unit_price)}</td>
        <td>${formatMoney(line.line_total)}</td>
      </tr>`;
    })
    .join("\n");

  const discountBlock = quoteDiscounts.length
    ? `<section>
        <h2>Discounts</h2>
        <ul>
          ${quoteDiscounts
            .map(
              (discount) => `<li>${escapeHtml(discount.discount_type)}: ${formatMoney(
                discount.discount_total ?? discount.discount_value
              )}${discount.reason ? ` (${escapeHtml(discount.reason)})` : ""}</li>`
            )
            .join("")}
        </ul>
      </section>`
    : "";

  const notesBlock = [quoteVersion.notes, quote.notes]
    .filter((note): note is string => typeof note === "string" && note.trim() !== "")
    .map((note) => `<p>${escapeHtml(note)}</p>`)
    .join("\n");

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
      <div>Date: ${escapeHtml(new Date().toISOString())}</div>
      <div>Template: ${escapeHtml(template.name)} (${escapeHtml(template.code)})</div>
      <h1>${escapeHtml(title)}</h1>
      <p>Commercial proposal prepared from quote version context.</p>
    </header>

    <section>
      <h2>Quote Metadata</h2>
      <div>Quote Number: ${escapeHtml(quote.quote_number)}</div>
      <div>Quote Status: ${escapeHtml(quote.status)}</div>
      <div>Quote Version: ${quoteVersion.version_number}</div>
      <div>Version Status: ${escapeHtml(quoteVersion.version_status)}</div>
      <div>Valid Until: ${quote.valid_until ? escapeHtml(quote.valid_until) : "-"}</div>
    </section>

    <section>
      <h2>Line Items</h2>
      <table border="1" cellspacing="0" cellpadding="6">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineRows || '<tr><td colspan="6">No line items</td></tr>'}
        </tbody>
      </table>
    </section>

    ${discountBlock}

    <section>
      <h2>Totals</h2>
      <div>Minimum Sale Total: ${formatMoney(quoteVersion.minimum_sale_total)}</div>
      <div>Actual Sale Total: ${formatMoney(quoteVersion.actual_sale_total)}</div>
      <div>Discount Total: ${formatMoney(quoteVersion.discount_total)}</div>
      <div><strong>Grand Total: ${formatMoney(quoteVersion.grand_total)}</strong></div>
    </section>

    ${notesBlock ? `<section><h2>Notes</h2>${notesBlock}</section>` : ""}
    ${templateHint}
  </body>
</html>`;
}

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number.isFinite(value) ? value.toFixed(2) : "-";
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number.isFinite(value) ? String(value) : "-";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function copyQuoteLinesToOrder(
  db: D1Database,
  orderId: number,
  quoteLines: QuoteLineRow[]
): Promise<void> {
  for (const line of quoteLines) {
    await db
      .prepare(
        `INSERT INTO order_lines (
          order_id, line_number, line_type, product_id,
          configuration_variant_id, quantity, unit_id, unit_price,
          minimum_unit_price, line_discount_type, line_discount_value,
          line_discount_total, line_total, fulfillment_status,
          snapshot_product_name, snapshot_sku, snapshot_unit_name,
          snapshot_description, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`
      )
      .bind(
        orderId,
        line.line_number,
        line.line_type,
        line.product_id,
        line.configuration_variant_id,
        line.quantity,
        line.unit_id,
        line.unit_price,
        line.minimum_unit_price,
        line.line_discount_type,
        line.line_discount_value,
        line.line_discount_total,
        line.line_total,
        line.snapshot_product_name,
        line.snapshot_sku,
        line.snapshot_unit_name,
        line.snapshot_description,
        line.notes
      )
      .run();
  }
}

async function copyQuoteDiscountsToOrder(
  db: D1Database,
  orderId: number,
  quoteDiscounts: QuoteDiscountRow[]
): Promise<void> {
  for (const discount of quoteDiscounts) {
    await db
      .prepare(
        `INSERT INTO order_discounts (
          order_id, discount_type, discount_value,
          discount_total, reason, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        orderId,
        discount.discount_type,
        discount.discount_value,
        discount.discount_total,
        discount.reason,
        discount.created_by_user_id
      )
      .run();
  }
}
