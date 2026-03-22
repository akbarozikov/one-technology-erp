import {
  TABLE_QUOTES,
  TABLE_USERS,
  type QuoteRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseQuoteCreate } from "../validation/quotes";

export async function handleQuotes(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM quotes ORDER BY created_at DESC, id DESC")
      .all<QuoteRow>();
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
  const input = parseQuoteCreate(body, errors);
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

  try {
    const row = await db
      .prepare(
        `INSERT INTO quotes (
          deal_id, quote_number, status, currency, minimum_sale_total,
          actual_sale_total, discount_total, grand_total, valid_until,
          created_by_user_id, approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.deal_id,
        input.quote_number,
        input.status,
        input.currency,
        input.minimum_sale_total,
        input.actual_sale_total,
        input.discount_total,
        input.grand_total,
        input.valid_until,
        input.created_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<QuoteRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
