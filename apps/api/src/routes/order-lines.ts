import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_ORDERS,
  TABLE_PRODUCTS,
  TABLE_UNITS_OF_MEASURE,
  type OrderLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseOrderLineCreate } from "../validation/order-lines";

export async function handleOrderLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM order_lines ORDER BY order_id DESC, line_number ASC, id ASC")
      .all<OrderLineRow>();
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
  const input = parseOrderLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const orderOk = await rowExists(db, TABLE_ORDERS, input.order_id);
  if (!orderOk) {
    return badRequest(`order_id ${input.order_id} not found`);
  }

  if (input.product_id !== null) {
    const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
    if (!productOk) {
      return badRequest(`product_id ${input.product_id} not found`);
    }
  }

  if (input.configuration_variant_id !== null) {
    const variantOk = await rowExists(
      db,
      TABLE_DOOR_CONFIGURATION_VARIANTS,
      input.configuration_variant_id
    );
    if (!variantOk) {
      return badRequest(
        `configuration_variant_id ${input.configuration_variant_id} not found`
      );
    }
  }

  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO order_lines (
          order_id, line_number, line_type, product_id,
          configuration_variant_id, quantity, unit_id, unit_price,
          minimum_unit_price, line_discount_type, line_discount_value,
          line_discount_total, line_total, fulfillment_status,
          snapshot_product_name, snapshot_sku, snapshot_unit_name,
          snapshot_description, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.order_id,
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
        input.fulfillment_status,
        input.snapshot_product_name,
        input.snapshot_sku,
        input.snapshot_unit_name,
        input.snapshot_description,
        input.notes
      )
      .first<OrderLineRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
