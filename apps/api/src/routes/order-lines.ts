import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_INSTALLATION_JOBS,
  TABLE_ORDERS,
  TABLE_PRODUCTS,
  TABLE_STOCK_MOVEMENTS,
  TABLE_STOCK_RESERVATIONS,
  TABLE_UNITS_OF_MEASURE,
  type FulfillmentStatus,
  type OrderLineRow,
  type StockMovementRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseOrderLineAction,
  parseOrderLineCreate,
  type OrderLineActionInput,
} from "../validation/order-lines";

type OrderLineAction = "mark-reserved" | "mark-issued" | "mark-installed";

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

export async function handleOrderLineAction(
  request: Request,
  env: Env,
  orderLineId: number,
  action: OrderLineAction
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const orderLine = await db
    .prepare("SELECT * FROM order_lines WHERE id = ? LIMIT 1")
    .bind(orderLineId)
    .first<OrderLineRow>();

  if (!orderLine) {
    return notFound(`order_line ${orderLineId} not found`);
  }

  if (orderLine.fulfillment_status === "cancelled") {
    return badRequest(`Order line ${orderLineId} is cancelled and cannot be updated operationally`);
  }

  if (
    action === "mark-reserved" &&
    orderLine.fulfillment_status === "installed"
  ) {
    return badRequest(`Order line ${orderLineId} is already installed and cannot be marked reserved`);
  }
  if (
    action === "mark-reserved" &&
    orderLine.fulfillment_status === "issued"
  ) {
    return badRequest(`Order line ${orderLineId} is already issued and cannot be marked reserved`);
  }
  if (
    action === "mark-issued" &&
    orderLine.fulfillment_status === "installed"
  ) {
    return badRequest(`Order line ${orderLineId} is already installed and cannot be marked issued`);
  }
  if (action === "mark-installed" && orderLine.fulfillment_status === "installed") {
    return badRequest(`Order line ${orderLineId} is already installed`);
  }

  const targetStatus = actionToFulfillmentStatus(action);

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseOrderLineAction(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const actionError = await validateOrderLineActionContext(db, input, action);
  if (actionError) {
    return badRequest(actionError);
  }

  try {
    const row = await db
      .prepare(
        `UPDATE order_lines
         SET fulfillment_status = ?,
             primary_reservation_id = CASE WHEN ? = 'mark-reserved' THEN COALESCE(?, primary_reservation_id) ELSE primary_reservation_id END,
             primary_stock_movement_id = CASE WHEN ? = 'mark-issued' THEN COALESCE(?, primary_stock_movement_id) ELSE primary_stock_movement_id END,
             primary_installation_job_id = CASE WHEN ? = 'mark-installed' THEN COALESCE(?, primary_installation_job_id) ELSE primary_installation_job_id END,
             fulfilled_at = CASE
               WHEN ? = 'mark-installed' THEN COALESCE(?, fulfilled_at, datetime('now'))
               ELSE fulfilled_at
             END,
             updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(
        targetStatus,
        action,
        input.reservation_id,
        action,
        input.stock_movement_id,
        action,
        input.installation_job_id,
        action,
        input.fulfilled_at,
        orderLineId
      )
      .first<OrderLineRow>();

    if (!row) {
      return notFound(`order_line ${orderLineId} not found`);
    }

    return jsonOk({ data: row });
  } catch (err) {
    return asSqlFailure(err);
  }
}

async function validateOrderLineActionContext(
  db: D1Database,
  input: OrderLineActionInput,
  action: OrderLineAction
): Promise<string | null> {
  if (action === "mark-reserved" && input.reservation_id !== null) {
    const reservationOk = await rowExists(db, TABLE_STOCK_RESERVATIONS, input.reservation_id);
    if (!reservationOk) {
      return `reservation_id ${input.reservation_id} not found`;
    }
  }

  if (action === "mark-issued" && input.stock_movement_id !== null) {
    const movement = await db
      .prepare("SELECT * FROM stock_movements WHERE id = ? LIMIT 1")
      .bind(input.stock_movement_id)
      .first<StockMovementRow>();
    if (!movement) {
      return `stock_movement_id ${input.stock_movement_id} not found`;
    }
    if (movement.status === "cancelled") {
      return `stock_movement_id ${input.stock_movement_id} is cancelled and cannot be linked to an issued order line`;
    }
  }

  if (action === "mark-installed" && input.installation_job_id !== null) {
    const installationJobOk = await rowExists(
      db,
      TABLE_INSTALLATION_JOBS,
      input.installation_job_id
    );
    if (!installationJobOk) {
      return `installation_job_id ${input.installation_job_id} not found`;
    }
  }

  return null;
}

function actionToFulfillmentStatus(action: OrderLineAction): FulfillmentStatus {
  switch (action) {
    case "mark-reserved":
      return "reserved";
    case "mark-issued":
      return "issued";
    case "mark-installed":
      return "installed";
  }
}
