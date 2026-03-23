import {
  TABLE_BOM_LINES,
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_ORDER_LINES,
  TABLE_ORDERS,
  TABLE_PRODUCTS,
  TABLE_QUOTE_LINES,
  TABLE_STOCK_MOVEMENTS,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  TABLE_WAREHOUSE_POSITIONS,
  type ReservationStatus,
  type StockMovementRow,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseStockReservationAction,
  parseStockReservationCreate,
  type StockReservationActionInput,
  type StockReservationCreateInput,
} from "../validation/stock-reservations";

type ReservationAction = "release" | "consume" | "cancel";

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

  const fkError = await validateReservationCreateContext(db, input);
  if (fkError) {
    return badRequest(fkError);
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

export async function handleStockReservationAction(
  request: Request,
  env: Env,
  reservationId: number,
  action: ReservationAction
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const reservation = await db
    .prepare("SELECT * FROM stock_reservations WHERE id = ? LIMIT 1")
    .bind(reservationId)
    .first<StockReservationRow>();

  if (!reservation) {
    return notFound(`stock_reservation ${reservationId} not found`);
  }

  const targetStatus = actionToStatus(action);
  if (reservation.status === targetStatus) {
    return badRequest(`Reservation ${reservationId} is already ${targetStatus}`);
  }
  if (action === "consume" && reservation.status === "cancelled") {
    return badRequest(`Reservation ${reservationId} is cancelled and cannot be consumed`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseStockReservationAction(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const actionError = await validateReservationActionContext(db, input, action);
  if (actionError) {
    return badRequest(actionError);
  }

  try {
    const row = await db
      .prepare(
        `UPDATE stock_reservations
         SET status = ?,
             released_by_user_id = COALESCE(?, released_by_user_id),
             release_reason = COALESCE(?, release_reason),
             consumed_order_id = CASE WHEN ? = 'consume' THEN COALESCE(?, consumed_order_id) ELSE consumed_order_id END,
             consumed_order_line_id = CASE WHEN ? = 'consume' THEN COALESCE(?, consumed_order_line_id) ELSE consumed_order_line_id END,
             consumed_stock_movement_id = CASE WHEN ? = 'consume' THEN COALESCE(?, consumed_stock_movement_id) ELSE consumed_stock_movement_id END,
             consumed_installation_job_id = CASE WHEN ? = 'consume' THEN COALESCE(?, consumed_installation_job_id) ELSE consumed_installation_job_id END,
             consumed_at = CASE
               WHEN ? = 'consume' THEN COALESCE(?, consumed_at, datetime('now'))
               ELSE consumed_at
             END,
             updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(
        targetStatus,
        input.released_by_user_id,
        input.release_reason,
        action,
        input.consumed_order_id,
        action,
        input.consumed_order_line_id,
        action,
        input.consumed_stock_movement_id,
        action,
        input.consumed_installation_job_id,
        action,
        input.consumed_at,
        reservationId
      )
      .first<StockReservationRow>();

    if (!row) {
      return notFound(`stock_reservation ${reservationId} not found`);
    }

    return jsonOk({ data: row });
  } catch (err) {
    return asSqlFailure(err);
  }
}

async function validateReservationCreateContext(
  db: D1Database,
  input: StockReservationCreateInput
): Promise<string | null> {
  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return `product_id ${input.product_id} not found`;
  }

  const warehouseOk = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
  if (!warehouseOk) {
    return `warehouse_id ${input.warehouse_id} not found`;
  }

  const positionOk = await rowExists(db, TABLE_WAREHOUSE_POSITIONS, input.position_id);
  if (!positionOk) {
    return `position_id ${input.position_id} not found`;
  }

  if (input.quote_line_id !== null) {
    const quoteLineOk = await rowExists(db, TABLE_QUOTE_LINES, input.quote_line_id);
    if (!quoteLineOk) {
      return `quote_line_id ${input.quote_line_id} not found`;
    }
  }

  if (input.order_line_id !== null) {
    const orderLineOk = await rowExists(db, TABLE_ORDER_LINES, input.order_line_id);
    if (!orderLineOk) {
      return `order_line_id ${input.order_line_id} not found`;
    }
  }

  if (input.configuration_variant_id !== null) {
    const variantOk = await rowExists(
      db,
      TABLE_DOOR_CONFIGURATION_VARIANTS,
      input.configuration_variant_id
    );
    if (!variantOk) {
      return `configuration_variant_id ${input.configuration_variant_id} not found`;
    }
  }

  if (input.bom_line_id !== null) {
    const bomLineOk = await rowExists(db, TABLE_BOM_LINES, input.bom_line_id);
    if (!bomLineOk) {
      return `bom_line_id ${input.bom_line_id} not found`;
    }
  }

  if (input.created_by_user_id !== null) {
    const createdByOk = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!createdByOk) {
      return `created_by_user_id ${input.created_by_user_id} not found`;
    }
  }

  if (input.released_by_user_id !== null) {
    const releasedByOk = await rowExists(db, TABLE_USERS, input.released_by_user_id);
    if (!releasedByOk) {
      return `released_by_user_id ${input.released_by_user_id} not found`;
    }
  }

  return null;
}

async function validateReservationActionContext(
  db: D1Database,
  input: StockReservationActionInput,
  action: ReservationAction
): Promise<string | null> {
  if (input.released_by_user_id !== null) {
    const userOk = await rowExists(db, TABLE_USERS, input.released_by_user_id);
    if (!userOk) {
      return `released_by_user_id ${input.released_by_user_id} not found`;
    }
  }

  if (action !== "consume") {
    return null;
  }

  if (input.consumed_order_id !== null) {
    const orderOk = await rowExists(db, TABLE_ORDERS, input.consumed_order_id);
    if (!orderOk) {
      return `consumed_order_id ${input.consumed_order_id} not found`;
    }
  }

  if (input.consumed_order_line_id !== null) {
    const orderLineOk = await rowExists(db, TABLE_ORDER_LINES, input.consumed_order_line_id);
    if (!orderLineOk) {
      return `consumed_order_line_id ${input.consumed_order_line_id} not found`;
    }
  }

  if (input.consumed_stock_movement_id !== null) {
    const movement = await db
      .prepare("SELECT * FROM stock_movements WHERE id = ? LIMIT 1")
      .bind(input.consumed_stock_movement_id)
      .first<StockMovementRow>();
    if (!movement) {
      return `consumed_stock_movement_id ${input.consumed_stock_movement_id} not found`;
    }
    if (movement.status === "cancelled") {
      return `consumed_stock_movement_id ${input.consumed_stock_movement_id} is cancelled and cannot be linked to a consumed reservation`;
    }
  }

  return null;
}

function actionToStatus(action: ReservationAction): ReservationStatus {
  switch (action) {
    case "release":
      return "released";
    case "consume":
      return "consumed";
    case "cancel":
      return "cancelled";
  }
}
