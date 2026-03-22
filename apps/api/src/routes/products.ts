import {
  TABLE_PRODUCT_CATEGORIES,
  TABLE_UNITS_OF_MEASURE,
  type ProductRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductCreate } from "../validation/products";

export async function handleProducts(request: Request, env: Env): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM products ORDER BY id ASC")
      .all<ProductRow>();
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
  const input = parseProductCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.category_id !== null) {
    const ok = await rowExists(db, TABLE_PRODUCT_CATEGORIES, input.category_id);
    if (!ok) {
      return badRequest(`category_id ${input.category_id} not found`);
    }
  }

  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.default_unit_id);
  if (!unitOk) {
    return badRequest(`default_unit_id ${input.default_unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO products (
          category_id, default_unit_id, name, sku, barcode, product_type, status,
          description, short_description, brand, minimum_sale_price,
          is_stock_tracked, is_sellable, is_purchasable, is_service,
          has_variants, has_attributes, allow_manual_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.category_id,
        input.default_unit_id,
        input.name,
        input.sku,
        input.barcode,
        input.product_type,
        input.status,
        input.description,
        input.short_description,
        input.brand,
        input.minimum_sale_price,
        input.is_stock_tracked,
        input.is_sellable,
        input.is_purchasable,
        input.is_service,
        input.has_variants,
        input.has_attributes,
        input.allow_manual_price
      )
      .first<ProductRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
