import {
  TABLE_PRODUCT_BUNDLES,
  TABLE_PRODUCTS,
  TABLE_UNITS_OF_MEASURE,
  type ProductBundleItemRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductBundleItemCreate } from "../validation/product-bundle-items";

export async function handleProductBundleItems(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM product_bundle_items ORDER BY bundle_id ASC, sort_order ASC, id ASC"
      )
      .all<ProductBundleItemRow>();
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
  const input = parseProductBundleItemCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const bOk = await rowExists(db, TABLE_PRODUCT_BUNDLES, input.bundle_id);
  if (!bOk) {
    return badRequest(`bundle_id ${input.bundle_id} not found`);
  }
  const cOk = await rowExists(db, TABLE_PRODUCTS, input.component_product_id);
  if (!cOk) {
    return badRequest(`component_product_id ${input.component_product_id} not found`);
  }
  const uOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!uOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO product_bundle_items (
          bundle_id, component_product_id, quantity, unit_id, sort_order, is_optional
        ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.bundle_id,
        input.component_product_id,
        input.quantity,
        input.unit_id,
        input.sort_order,
        input.is_optional
      )
      .first<ProductBundleItemRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
