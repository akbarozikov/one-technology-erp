import {
  TABLE_USERS,
  TABLE_WAREHOUSES,
  type StockTransferDocumentRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockTransferDocumentCreate } from "../validation/stock-transfer-documents";

export async function handleStockTransferDocuments(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM stock_transfer_documents ORDER BY transfer_date DESC, id DESC"
      )
      .all<StockTransferDocumentRow>();
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
  const input = parseStockTransferDocumentCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const sourceOk = await rowExists(db, TABLE_WAREHOUSES, input.source_warehouse_id);
  if (!sourceOk) {
    return badRequest(`source_warehouse_id ${input.source_warehouse_id} not found`);
  }
  const destinationOk = await rowExists(
    db,
    TABLE_WAREHOUSES,
    input.destination_warehouse_id
  );
  if (!destinationOk) {
    return badRequest(
      `destination_warehouse_id ${input.destination_warehouse_id} not found`
    );
  }
  if (input.requested_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.requested_by_user_id);
    if (!ok) {
      return badRequest(`requested_by_user_id ${input.requested_by_user_id} not found`);
    }
  }
  if (input.confirmed_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.confirmed_by_user_id);
    if (!ok) {
      return badRequest(`confirmed_by_user_id ${input.confirmed_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_transfer_documents (
          reference_code, source_warehouse_id, destination_warehouse_id,
          transfer_date, status, requested_by_user_id, confirmed_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.reference_code,
        input.source_warehouse_id,
        input.destination_warehouse_id,
        input.transfer_date,
        input.status,
        input.requested_by_user_id,
        input.confirmed_by_user_id,
        input.notes
      )
      .first<StockTransferDocumentRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
