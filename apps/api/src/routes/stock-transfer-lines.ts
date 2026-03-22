import {
  TABLE_PRODUCTS,
  TABLE_STOCK_TRANSFER_DOCUMENTS,
  TABLE_UNITS_OF_MEASURE,
  TABLE_WAREHOUSE_POSITIONS,
  type StockTransferLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockTransferLineCreate } from "../validation/stock-transfer-lines";

export async function handleStockTransferLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM stock_transfer_lines ORDER BY stock_transfer_document_id DESC, id DESC"
      )
      .all<StockTransferLineRow>();
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
  const input = parseStockTransferLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const docOk = await rowExists(
    db,
    TABLE_STOCK_TRANSFER_DOCUMENTS,
    input.stock_transfer_document_id
  );
  if (!docOk) {
    return badRequest(
      `stock_transfer_document_id ${input.stock_transfer_document_id} not found`
    );
  }
  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }
  const fromOk = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.from_position_id);
  if (!fromOk) {
    return badRequest(`from_position_id ${input.from_position_id} not found`);
  }
  const toOk = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.to_position_id);
  if (!toOk) {
    return badRequest(`to_position_id ${input.to_position_id} not found`);
  }
  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_transfer_lines (
          stock_transfer_document_id, product_id, from_position_id,
          to_position_id, quantity, unit_id, line_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.stock_transfer_document_id,
        input.product_id,
        input.from_position_id,
        input.to_position_id,
        input.quantity,
        input.unit_id,
        input.line_notes
      )
      .first<StockTransferLineRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
