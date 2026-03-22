import {
  TABLE_QUOTES,
  TABLE_QUOTE_VERSIONS,
  TABLE_USERS,
  type QuoteVersionRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseQuoteVersionCreate } from "../validation/quote-versions";

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
