import {
  TABLE_BOM_LINES,
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_PRODUCTS,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  TABLE_WAREHOUSE_POSITIONS,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseStockReservationCreate } from "../validation/stock-reservations";

export async function handleStockReservations(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM stock_reservations ORDER BY created_at DESC, id DESC")
      .all<StockReservationRow>();
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
  const input = parseStockReservationCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }

  const warehouseOk = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
  if (!warehouseOk) {
    return badRequest(`warehouse_id ${input.warehouse_id} not found`);
  }

  const positionOk = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.position_id);
  if (!positionOk) {
    return badRequest(`position_id ${input.position_id} not found`);
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

  if (input.bom_line_id !== null) {
    const bomLineOk = await rowExists(db, TABLE_BOM_LINES, input.bom_line_id);
    if (!bomLineOk) {
      return badRequest(`bom_line_id ${input.bom_line_id} not found`);
    }
  }

  if (input.created_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!ok) {
      return badRequest(`created_by_user_id ${input.created_by_user_id} not found`);
    }
  }

  if (input.released_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.released_by_user_id);
    if (!ok) {
      return badRequest(`released_by_user_id ${input.released_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO stock_reservations (
          product_id, warehouse_id, position_id, quote_line_id, order_line_id,
          configuration_variant_id, bom_line_id, reserved_qty, status,
          reserved_from, reserved_until, reservation_reason,
          created_by_user_id, released_by_user_id, release_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.product_id,
        input.warehouse_id,
        input.position_id,
        input.quote_line_id,
        input.order_line_id,
        input.configuration_variant_id,
        input.bom_line_id,
        input.reserved_qty,
        input.status,
        input.reserved_from,
        input.reserved_until,
        input.reservation_reason,
        input.created_by_user_id,
        input.released_by_user_id,
        input.release_reason
      )
      .first<StockReservationRow>();

    if (!row) {
      return badRequest("Insert did not return a row");
    }

    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
