import {
  TABLE_PRODUCTS,
  TABLE_QUOTE_VERSIONS,
  TABLE_UNITS_OF_MEASURE,
  type QuoteLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseQuoteLineCreate } from "../validation/quote-lines";

export async function handleQuoteLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM quote_lines ORDER BY quote_version_id DESC, line_number ASC, id ASC"
      )
      .all<QuoteLineRow>();
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
  const input = parseQuoteLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const quoteVersionOk = await rowExists(db, TABLE_QUOTE_VERSIONS, input.quote_version_id);
  if (!quoteVersionOk) {
    return badRequest(`quote_version_id ${input.quote_version_id} not found`);
  }

  if (input.product_id !== null) {
    const ok = await rowExists(db, TABLE_PRODUCTS, input.product_id);
    if (!ok) {
      return badRequest(`product_id ${input.product_id} not found`);
    }
  }

  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO quote_lines (
          quote_version_id, line_number, line_type, product_id,
          configuration_variant_id, quantity, unit_id, unit_price,
          minimum_unit_price, line_discount_type, line_discount_value,
          line_discount_total, line_total, snapshot_product_name,
          snapshot_sku, snapshot_unit_name, snapshot_description, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.quote_version_id,
        input.line_number,
        input.line_type,
        input.product_id,
        input.configuration_variant_id,
        input.quantity,
        input.unit_id,
        input.unit_price,
        input.minimum_unit_price,
        input.line_discount_type,
        input.line_discount_value,
        input.line_discount_total,
        input.line_total,
        input.snapshot_product_name,
        input.snapshot_sku,
        input.snapshot_unit_name,
        input.snapshot_description,
        input.notes
      )
      .first<QuoteLineRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
