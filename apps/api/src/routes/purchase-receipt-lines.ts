import {
  TABLE_PRODUCTS,
  TABLE_PURCHASE_RECEIPTS,
  TABLE_UNITS_OF_MEASURE,
  TABLE_WAREHOUSE_POSITIONS,
  type PurchaseReceiptLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parsePurchaseReceiptLineCreate } from "../validation/purchase-receipt-lines";

export async function handlePurchaseReceiptLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM purchase_receipt_lines ORDER BY purchase_receipt_id DESC, line_number ASC, id DESC"
      )
      .all<PurchaseReceiptLineRow>();
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
  const input = parsePurchaseReceiptLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const receiptOk = await rowExists(db, TABLE_PURCHASE_RECEIPTS, input.purchase_receipt_id);
  if (!receiptOk) {
    return badRequest(`purchase_receipt_id ${input.purchase_receipt_id} not found`);
  }
  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }
  const positionOk = await rowExists(
    db,
    TABLE_WAREHOUSE_POSITIONS,
    input.destination_position_id
  );
  if (!positionOk) {
    return badRequest(
      `destination_position_id ${input.destination_position_id} not found`
    );
  }
  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO purchase_receipt_lines (
          purchase_receipt_id, line_number, product_id, destination_position_id,
          quantity, unit_id, unit_cost, line_total, snapshot_product_name,
          snapshot_sku, snapshot_unit_name, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.purchase_receipt_id,
        input.line_number,
        input.product_id,
        input.destination_position_id,
        input.quantity,
        input.unit_id,
        input.unit_cost,
        input.line_total,
        input.snapshot_product_name,
        input.snapshot_sku,
        input.snapshot_unit_name,
        input.notes
      )
      .first<PurchaseReceiptLineRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
