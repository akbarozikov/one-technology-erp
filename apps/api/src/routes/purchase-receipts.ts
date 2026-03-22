import {
  TABLE_SUPPLIERS,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  type PurchaseReceiptRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parsePurchaseReceiptCreate } from "../validation/purchase-receipts";

function generateReceiptNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PR-${stamp}-${random}`;
}

export async function handlePurchaseReceipts(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM purchase_receipts ORDER BY receipt_date DESC, id DESC")
      .all<PurchaseReceiptRow>();
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
  const input = parsePurchaseReceiptCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const supplierOk = await rowExists(db, TABLE_SUPPLIERS, input.supplier_id);
  if (!supplierOk) {
    return badRequest(`supplier_id ${input.supplier_id} not found`);
  }

  const warehouseOk = await rowExists(
    db,
    TABLE_WAREHOUSES,
    input.destination_warehouse_id
  );
  if (!warehouseOk) {
    return badRequest(
      `destination_warehouse_id ${input.destination_warehouse_id} not found`
    );
  }

  if (input.received_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.received_by_user_id);
    if (!ok) {
      return badRequest(`received_by_user_id ${input.received_by_user_id} not found`);
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
        `INSERT INTO purchase_receipts (
          receipt_number, supplier_id, destination_warehouse_id, receipt_date, status,
          source_document_number, currency, total_amount, received_by_user_id,
          approved_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.receipt_number ?? generateReceiptNumber(),
        input.supplier_id,
        input.destination_warehouse_id,
        input.receipt_date,
        input.status,
        input.source_document_number,
        input.currency,
        input.total_amount,
        input.received_by_user_id,
        input.approved_by_user_id,
        input.notes
      )
      .first<PurchaseReceiptRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
