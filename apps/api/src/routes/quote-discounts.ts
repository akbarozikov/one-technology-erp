import {
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type QuoteDiscountRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseQuoteDiscountCreate } from "../validation/quote-discounts";

export async function handleQuoteDiscounts(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM quote_discounts ORDER BY quote_version_id DESC, id DESC")
      .all<QuoteDiscountRow>();
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
  const input = parseQuoteDiscountCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const quoteVersionOk = await rowExists(db, TABLE_QUOTE_VERSIONS, input.quote_version_id);
  if (!quoteVersionOk) {
    return badRequest(`quote_version_id ${input.quote_version_id} not found`);
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
        `INSERT INTO quote_discounts (
          quote_version_id, discount_type, discount_value, discount_total,
          reason, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.quote_version_id,
        input.discount_type,
        input.discount_value,
        input.discount_total,
        input.reason,
        input.created_by_user_id
      )
      .first<QuoteDiscountRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
