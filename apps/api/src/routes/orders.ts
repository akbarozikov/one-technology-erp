import {
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type OrderRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
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
