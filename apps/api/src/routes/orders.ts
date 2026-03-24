import {
  TABLE_DOCUMENT_TEMPLATES,
  TABLE_ORDER_LINES,
  TABLE_ORDER_DISCOUNTS,
  TABLE_PAYMENT_METHODS,
  TABLE_QUOTE_LINES,
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type DocumentTemplateRow,
  type GeneratedDocumentRow,
  type OrderDiscountRow,
  type OrderPaymentStatus,
  TABLE_STOCK_RESERVATIONS,
  type OrderLineRow,
  type OrderRow,
  type PaymentRow,
  type QuoteLineRow,
  type QuoteVersionRow,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseOrderCreate,
  parseOrderCreatePaymentRecord,
  parseOrderGenerateDocument,
} from "../validation/orders";

export async function handleOrders(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC")
      .all<OrderRow>();
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
  const input = parseOrderCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.quote_version_id !== null) {
    const ok = await rowExists(db, TABLE_QUOTE_VERSIONS, input.quote_version_id);
    if (!ok) {
      return badRequest(`quote_version_id ${input.quote_version_id} not found`);
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

  try {
    const row = await db
      .prepare(
        `INSERT INTO orders (
          quote_version_id, customer_id, deal_id, order_number,
          installation_required, fulfillment_type, order_status,
          payment_status, reservation_status, currency,
          minimum_sale_total, actual_sale_total, discount_total,
          grand_total, paid_total, remaining_total, order_date,
          planned_installation_date, completed_at, created_by_user_id,
          approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.quote_version_id,
        input.customer_id,
        input.deal_id,
        input.order_number,
        input.installation_required,
        input.fulfillment_type,
        input.order_status,
        input.payment_status,
        input.reservation_status,
        input.currency,
        input.minimum_sale_total,
        input.actual_sale_total,
        input.discount_total,
        input.grand_total,
        input.paid_total,
        input.remaining_total,
        input.order_date,
        input.planned_installation_date,
        input.completed_at,
        input.created_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<OrderRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}

export async function handleOrderAction(
  request: Request,
  env: Env,
  orderId: number,
  action: "adopt-reservations" | "generate-document" | "create-payment-record"
): Promise<Response> {
  if (action === "adopt-reservations") {
    return handleAdoptReservations(request, env, orderId);
  }

  if (action === "generate-document") {
    return handleGenerateOrderDocument(request, env, orderId);
  }

  if (action === "create-payment-record") {
    return handleCreatePaymentRecord(request, env, orderId);
  }

  return notFound();
}

async function handleCreatePaymentRecord(
  request: Request,
  env: Env,
  orderId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const order = await db
    .prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderRow>();

  if (!order) {
    return notFound(`order ${orderId} not found`);
  }

  if (order.order_status === "cancelled") {
    return badRequest(`order ${orderId} is cancelled and cannot accept new payments`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseOrderCreatePaymentRecord(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const methodOk = await rowExists(db, TABLE_PAYMENT_METHODS, input.payment_method_id);
  if (!methodOk) {
    return badRequest(`payment_method_id ${input.payment_method_id} not found`);
  }

  if (input.received_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.received_by_user_id);
    if (!ok) {
      return badRequest(`received_by_user_id ${input.received_by_user_id} not found`);
    }
  }

  const currentSummary = await calculateOrderPaymentSummary(
    db,
    order.id,
    order.grand_total ?? 0
  );
  const currentRemaining = currentSummary.remainingTotal;
  const amount = input.amount ?? currentRemaining;
  if (amount === null || amount <= 0 || currentRemaining <= 0) {
    return badRequest(
      `Order ${orderId} does not have a positive remaining balance for payment creation`
    );
  }

  if (amount > currentRemaining) {
    return badRequest(
      `Payment amount ${amount.toFixed(2)} exceeds the current remaining balance ${currentRemaining.toFixed(2)} for order ${orderId}`
    );
  }

  try {
    await db.exec("BEGIN TRANSACTION");

    const payment = await db
      .prepare(
        `INSERT INTO payments (
          order_id, payment_method_id, payment_date, amount,
          currency, reference_number, received_by_user_id, notes, status
        ) VALUES (?, ?, COALESCE(?, datetime('now')), ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        order.id,
        input.payment_method_id,
        input.payment_date,
        amount,
        order.currency,
        input.reference_number,
        input.received_by_user_id,
        input.notes,
        input.status
      )
      .first<PaymentRow>();

    if (!payment) {
      throw new Error("Insert did not return a payment row");
    }

    const refreshedOrder = await refreshOrderPaymentSummary(db, order);

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          payment,
          order: refreshedOrder,
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

async function handleAdoptReservations(
  request: Request,
  env: Env,
  orderId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const order = await db
    .prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderRow>();

  if (!order) {
    return notFound(`order ${orderId} not found`);
  }

  if (order.quote_version_id === null) {
    return badRequest(`Order ${orderId} is not linked to a quote_version and cannot adopt reservations`);
  }

  const { results: orderLines } = await db
    .prepare("SELECT * FROM order_lines WHERE order_id = ? ORDER BY line_number ASC, id ASC")
    .bind(orderId)
    .all<OrderLineRow>();

  const { results: quoteLines } = await db
    .prepare(
      "SELECT * FROM quote_lines WHERE quote_version_id = ? ORDER BY line_number ASC, id ASC"
    )
    .bind(order.quote_version_id)
    .all<QuoteLineRow>();

  const quoteLineList = quoteLines ?? [];
  if (quoteLineList.length === 0) {
    return jsonOk({
      data: {
        adopted_count: 0,
        skipped_count: 0,
        adopted_reservation_ids: [],
        skipped_items: [],
      },
    });
  }

  const quoteLineIds = quoteLineList.map((line) => line.id);
  const quoteLineById = new Map(quoteLineList.map((line) => [line.id, line]));
  const reservations = await loadActiveReservationsForQuoteLines(db, quoteLineIds);

  const adoptedReservationIds: number[] = [];
  const skippedItems: Array<{ reservation_id: number; reason: string }> = [];

  try {
    await db.exec("BEGIN TRANSACTION");

    for (const reservation of reservations) {
      if (reservation.order_line_id !== null) {
        skippedItems.push({
          reservation_id: reservation.id,
          reason: "already linked to order_line",
        });
        continue;
      }

      const sourceQuoteLine = reservation.quote_line_id
        ? quoteLineById.get(reservation.quote_line_id) ?? null
        : null;
      if (!sourceQuoteLine) {
        skippedItems.push({
          reservation_id: reservation.id,
          reason: "source quote_line not found",
        });
        continue;
      }

      const matchingOrderLines = findMatchingOrderLines(
        reservation,
        sourceQuoteLine,
        orderLines ?? []
      );

      if (matchingOrderLines.length === 0) {
        skippedItems.push({
          reservation_id: reservation.id,
          reason: "no safe matching order_line found",
        });
        continue;
      }

      if (matchingOrderLines.length > 1) {
        skippedItems.push({
          reservation_id: reservation.id,
          reason: "multiple matching order_lines found",
        });
        continue;
      }

      const adopted = await db
        .prepare(
          `UPDATE stock_reservations
           SET order_line_id = ?, updated_at = datetime('now')
           WHERE id = ?
           RETURNING *`
        )
        .bind(matchingOrderLines[0].id, reservation.id)
        .first<StockReservationRow>();

      if (!adopted) {
        throw new Error(`Failed to adopt reservation ${reservation.id}`);
      }

      adoptedReservationIds.push(adopted.id);
    }

    await db.exec("COMMIT");

    return jsonOk({
      data: {
        adopted_count: adoptedReservationIds.length,
        skipped_count: skippedItems.length,
        adopted_reservation_ids: adoptedReservationIds,
        skipped_items: skippedItems,
      },
    });
  } catch (err) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore rollback errors and preserve the original failure.
    }
    return asSqlFailure(err);
  }
}

async function handleGenerateOrderDocument(
  request: Request,
  env: Env,
  orderId: number
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const order = await db
    .prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderRow>();

  if (!order) {
    return notFound(`order ${orderId} not found`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseOrderGenerateDocument(body, errors);
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

  if (template.template_type !== "order") {
    return badRequest(`document_template ${template.id} must have template_type order`);
  }

  if (template.entity_type !== "order") {
    return badRequest(`document_template ${template.id} must have entity_type order`);
  }

  const { results: orderLines } = await db
    .prepare("SELECT * FROM order_lines WHERE order_id = ? ORDER BY line_number ASC, id ASC")
    .bind(orderId)
    .all<OrderLineRow>();
  const { results: orderDiscounts } = await db
    .prepare("SELECT * FROM order_discounts WHERE order_id = ? ORDER BY id ASC")
    .bind(orderId)
    .all<OrderDiscountRow>();

  const quoteVersion =
    order.quote_version_id === null
      ? null
      : await db
          .prepare("SELECT * FROM quote_versions WHERE id = ? LIMIT 1")
          .bind(order.quote_version_id)
          .first<QuoteVersionRow>();

  const documentNumber = buildOrderDocumentNumber(order, input.document_number);
  const title = input.title ?? `Order Document ${order.order_number}`;
  const renderedContent = buildOrderDocumentHtml(
    template,
    order,
    orderLines ?? [],
    orderDiscounts ?? [],
    title,
    documentNumber,
    quoteVersion ?? null
  );

  try {
    await db.exec("BEGIN TRANSACTION");

    const generatedDocument = await db
      .prepare(
        `INSERT INTO generated_documents (
          template_id, document_number, title, entity_type, entity_id,
          generation_status, rendered_content, file_url, file_name,
          mime_type, generated_by_user_id, generated_at
        ) VALUES (?, ?, ?, 'order', ?, 'generated', ?, NULL, NULL, ?, ?, datetime('now')) RETURNING *`
      )
      .bind(
        input.template_id,
        documentNumber,
        title,
        order.id,
        renderedContent,
        "text/html",
        input.generated_by_user_id
      )
      .first<GeneratedDocumentRow>();

    if (!generatedDocument) {
      throw new Error("Insert did not return a generated document row");
    }

    if (input.create_order_link === 1) {
      await db
        .prepare(
          `INSERT INTO document_links (
            generated_document_id, entity_type, entity_id, link_role
          ) VALUES (?, 'order', ?, 'primary')`
        )
        .bind(generatedDocument.id, order.id)
        .run();
    }

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          generated_document: generatedDocument,
          linked_order: input.create_order_link === 1,
          line_count: orderLines?.length ?? 0,
          discount_count: orderDiscounts?.length ?? 0,
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

async function loadActiveReservationsForQuoteLines(
  db: D1Database,
  quoteLineIds: number[]
): Promise<StockReservationRow[]> {
  const placeholders = quoteLineIds.map(() => "?").join(", ");
  const statement = db.prepare(
    `SELECT * FROM stock_reservations
     WHERE status = 'active'
       AND quote_line_id IN (${placeholders})
     ORDER BY id ASC`
  );
  const { results } = await statement.bind(...quoteLineIds).all<StockReservationRow>();
  return results ?? [];
}

function findMatchingOrderLines(
  reservation: StockReservationRow,
  sourceQuoteLine: QuoteLineRow,
  orderLines: OrderLineRow[]
): OrderLineRow[] {
  const sameTypeLines = orderLines.filter(
    (orderLine) => orderLine.line_type === sourceQuoteLine.line_type
  );

  if (sourceQuoteLine.configuration_variant_id !== null) {
    return sameTypeLines.filter(
      (orderLine) =>
        orderLine.configuration_variant_id === sourceQuoteLine.configuration_variant_id
    );
  }

  return sameTypeLines.filter(
    (orderLine) => orderLine.product_id === reservation.product_id
  );
}

async function refreshOrderPaymentSummary(
  db: D1Database,
  order: OrderRow
): Promise<OrderRow> {
  const grandTotal = order.grand_total ?? 0;
  const summary = await calculateOrderPaymentSummary(db, order.id, grandTotal);

  const updatedOrder = await db
    .prepare(
      `UPDATE orders
       SET paid_total = ?, remaining_total = ?, payment_status = ?, updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(summary.paidTotal, summary.remainingTotal, summary.paymentStatus, order.id)
    .first<OrderRow>();

  if (!updatedOrder) {
    throw new Error(`Failed to refresh payment summary for order ${order.id}`);
  }

  return updatedOrder;
}

async function calculateOrderPaymentSummary(
  db: D1Database,
  orderId: number,
  grandTotal: number
): Promise<{
  paidTotal: number;
  remainingTotal: number;
  paymentStatus: OrderPaymentStatus;
}> {
  const paymentTotals = await db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS paid_total
       FROM payments
       WHERE order_id = ? AND status != 'cancelled'`
    )
    .bind(orderId)
    .first<{ paid_total: number | null }>();

  const paidTotal = paymentTotals?.paid_total ?? 0;
  const remainingTotal = Math.max(grandTotal - paidTotal, 0);
  const paymentStatus = deriveOrderPaymentStatus(paidTotal, grandTotal);

  return {
    paidTotal,
    remainingTotal,
    paymentStatus,
  };
}

function deriveOrderPaymentStatus(
  paidTotal: number,
  grandTotal: number
): OrderPaymentStatus {
  if (paidTotal <= 0) {
    return "unpaid";
  }
  if (paidTotal < grandTotal) {
    return "partially_paid";
  }
  return "paid";
}

function buildOrderDocumentNumber(
  order: OrderRow,
  requestedDocumentNumber: string | null
): string {
  if (requestedDocumentNumber) {
    return requestedDocumentNumber;
  }

  return `${order.order_number}-DOC`;
}

function buildOrderDocumentHtml(
  template: DocumentTemplateRow,
  order: OrderRow,
  orderLines: OrderLineRow[],
  orderDiscounts: OrderDiscountRow[],
  title: string,
  documentNumber: string,
  quoteVersion: QuoteVersionRow | null
): string {
  const lineRows = orderLines
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
        <td>${escapeHtml(line.fulfillment_status)}</td>
      </tr>`;
    })
    .join("\n");

  const discountBlock = orderDiscounts.length
    ? `<section>
        <h2>Discounts</h2>
        <ul>
          ${orderDiscounts
            .map(
              (discount) => `<li>${escapeHtml(discount.discount_type)}: ${formatMoney(
                discount.discount_total ?? discount.discount_value
              )}${discount.reason ? ` (${escapeHtml(discount.reason)})` : ""}</li>`
            )
            .join("")}
        </ul>
      </section>`
    : "";

  const quoteVersionBlock = quoteVersion
    ? `<div>Quote Version Reference: ${quoteVersion.id} / V${quoteVersion.version_number}</div>`
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
      <div>Date: ${escapeHtml(order.order_date)}</div>
      <div>Template: ${escapeHtml(template.name)} (${escapeHtml(template.code)})</div>
      <h1>${escapeHtml(title)}</h1>
      <p>Order document generated from order context.</p>
    </header>

    <section>
      <h2>Order Metadata</h2>
      <div>Order Number: ${escapeHtml(order.order_number)}</div>
      <div>Order Status: ${escapeHtml(order.order_status)}</div>
      <div>Payment Status: ${escapeHtml(order.payment_status)}</div>
      <div>Reservation Status: ${escapeHtml(order.reservation_status)}</div>
      <div>Fulfillment Type: ${escapeHtml(order.fulfillment_type)}</div>
      <div>Installation Required: ${order.installation_required === 1 ? "Yes" : "No"}</div>
      ${quoteVersionBlock}
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
            <th>Fulfillment</th>
          </tr>
        </thead>
        <tbody>
          ${lineRows || '<tr><td colspan="7">No line items</td></tr>'}
        </tbody>
      </table>
    </section>

    ${discountBlock}

    <section>
      <h2>Totals</h2>
      <div>Minimum Sale Total: ${formatMoney(order.minimum_sale_total)}</div>
      <div>Actual Sale Total: ${formatMoney(order.actual_sale_total)}</div>
      <div>Discount Total: ${formatMoney(order.discount_total)}</div>
      <div>Grand Total: ${formatMoney(order.grand_total)}</div>
      <div>Paid Total: ${formatMoney(order.paid_total)}</div>
      <div><strong>Remaining Total: ${formatMoney(order.remaining_total)}</strong></div>
    </section>

    ${order.notes ? `<section><h2>Notes</h2><p>${escapeHtml(order.notes)}</p></section>` : ""}
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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
