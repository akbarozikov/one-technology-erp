import {
  TABLE_ORDERS,
  TABLE_PAYMENT_METHODS,
  TABLE_USERS,
  type PaymentRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parsePaymentCreate } from "../validation/payments";

export async function handlePayments(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM payments ORDER BY payment_date DESC, id DESC")
      .all<PaymentRow>();
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
  const input = parsePaymentCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const orderOk = await rowExists(db, TABLE_ORDERS, input.order_id);
  if (!orderOk) {
    return badRequest(`order_id ${input.order_id} not found`);
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

  try {
    const row = await db
      .prepare(
        `INSERT INTO payments (
          order_id, payment_method_id, payment_date, amount,
          currency, reference_number, received_by_user_id, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.order_id,
        input.payment_method_id,
        input.payment_date,
        input.amount,
        input.currency,
        input.reference_number,
        input.received_by_user_id,
        input.notes,
        input.status
      )
      .first<PaymentRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
