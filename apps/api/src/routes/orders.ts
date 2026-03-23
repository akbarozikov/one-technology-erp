import {
  TABLE_ORDER_LINES,
  TABLE_QUOTE_LINES,
  TABLE_STOCK_RESERVATIONS,
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type OrderLineRow,
  type OrderRow,
  type QuoteLineRow,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import { parseOrderCreate } from "../validation/orders";

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
  action: "adopt-reservations"
): Promise<Response> {
  if (action !== "adopt-reservations") {
    return notFound();
  }

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
