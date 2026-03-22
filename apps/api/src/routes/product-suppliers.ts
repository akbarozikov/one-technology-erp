import {
  TABLE_PRODUCTS,
  TABLE_SUPPLIERS,
  type ProductSupplierRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductSupplierCreate } from "../validation/product-suppliers";

export async function handleProductSuppliers(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM product_suppliers ORDER BY id ASC")
      .all<ProductSupplierRow>();
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
  const input = parseProductSupplierCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const pOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!pOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }
  const sOk = await rowExists(db, TABLE_SUPPLIERS, input.supplier_id);
  if (!sOk) {
    return badRequest(`supplier_id ${input.supplier_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO product_suppliers (
          product_id, supplier_id, supplier_sku, purchase_price, currency, lead_time_days, is_preferred
        ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.product_id,
        input.supplier_id,
        input.supplier_sku,
        input.purchase_price,
        input.currency,
        input.lead_time_days,
        input.is_preferred
      )
      .first<ProductSupplierRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
