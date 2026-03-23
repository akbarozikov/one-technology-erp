import {
  TABLE_BOM_LINES,
  TABLE_DOOR_CONFIGURATIONS,
  TABLE_PRODUCTS,
  TABLE_STOCK_RESERVATIONS,
  TABLE_USERS,
  TABLE_WAREHOUSES,
  TABLE_WAREHOUSE_POSITIONS,
  type BomLineRow,
  type DoorConfigurationVariantRow,
  type StockReservationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject, readOptionalJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import {
  parseDoorConfigurationVariantCreate,
  parseDoorConfigurationVariantCreateReservationDraft,
} from "../validation/door-configuration-variants";

export async function handleDoorConfigurationVariants(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM door_configuration_variants ORDER BY configuration_id DESC, variant_number DESC, id DESC"
      )
      .all<DoorConfigurationVariantRow>();
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
  const input = parseDoorConfigurationVariantCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const configurationOk = await rowExists(
    db,
    TABLE_DOOR_CONFIGURATIONS,
    input.configuration_id
  );
  if (!configurationOk) {
    return badRequest(`configuration_id ${input.configuration_id} not found`);
  }

  if (input.created_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!ok) {
      return badRequest(`created_by_user_id ${input.created_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO door_configuration_variants (
          configuration_id, variant_number, name, description, is_current,
          is_selected, variant_status, quote_line_id, order_line_id,
          minimum_sale_total, actual_sale_total, bom_total_cost, bom_total_items,
          created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.configuration_id,
        input.variant_number,
        input.name,
        input.description,
        input.is_current,
        input.is_selected,
        input.variant_status,
        input.quote_line_id,
        input.order_line_id,
        input.minimum_sale_total,
        input.actual_sale_total,
        input.bom_total_cost,
        input.bom_total_items,
        input.created_by_user_id
      )
      .first<DoorConfigurationVariantRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}

export async function handleDoorConfigurationVariantAction(
  request: Request,
  env: Env,
  variantId: number,
  action: "create-reservation-draft"
): Promise<Response> {
  if (action !== "create-reservation-draft") {
    return notFound();
  }

  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const variant = await db
    .prepare("SELECT * FROM door_configuration_variants WHERE id = ? LIMIT 1")
    .bind(variantId)
    .first<DoorConfigurationVariantRow>();

  if (!variant) {
    return notFound(`door_configuration_variant ${variantId} not found`);
  }

  let body: Record<string, unknown>;
  try {
    body = await readOptionalJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const errors: string[] = [];
  const input = parseDoorConfigurationVariantCreateReservationDraft(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const warehouseOk = await rowExists(db, TABLE_WAREHOUSES, input.warehouse_id);
  if (!warehouseOk) {
    return badRequest(`warehouse_id ${input.warehouse_id} not found`);
  }

  const positionOk = await rowExists(
    db,
    TABLE_WAREHOUSE_POSITIONS,
    input.default_position_id
  );
  if (!positionOk) {
    return badRequest(`default_position_id ${input.default_position_id} not found`);
  }

  if (input.created_by_user_id !== null) {
    const userOk = await rowExists(db, TABLE_USERS, input.created_by_user_id);
    if (!userOk) {
      return badRequest(`created_by_user_id ${input.created_by_user_id} not found`);
    }
  }

  const { results } = await db
    .prepare(
      `SELECT * FROM bom_lines
       WHERE variant_id = ?
         AND line_status = 'active'
         AND (? = 1 OR is_optional = 0)
       ORDER BY line_number ASC, id ASC`
    )
    .bind(variantId, input.include_optional)
    .all<BomLineRow>();
  const bomLines = results ?? [];

  for (const bomLine of bomLines) {
    if (!bomLine.product_id) {
      return badRequest(`bom_line ${bomLine.id} is missing product_id`);
    }

    const productOk = await rowExists(db, TABLE_PRODUCTS, bomLine.product_id);
    if (!productOk) {
      return badRequest(`product_id ${bomLine.product_id} from bom_line ${bomLine.id} not found`);
    }
  }

  const createdReservationIds: number[] = [];
  const skippedBomLineIds: number[] = [];

  try {
    await db.exec("BEGIN TRANSACTION");

    for (const bomLine of bomLines) {
      const existingActive = await db
        .prepare(
          `SELECT id FROM stock_reservations
           WHERE configuration_variant_id = ?
             AND bom_line_id = ?
             AND product_id = ?
             AND status = 'active'
           LIMIT 1`
        )
        .bind(variantId, bomLine.id, bomLine.product_id)
        .first<{ id: number }>();

      if (existingActive) {
        skippedBomLineIds.push(bomLine.id);
        continue;
      }

      const row = await db
        .prepare(
          `INSERT INTO stock_reservations (
            product_id, warehouse_id, position_id, quote_line_id, order_line_id,
            configuration_variant_id, bom_line_id, reserved_qty, status,
            reserved_from, reserved_until, reservation_reason,
            created_by_user_id, released_by_user_id, release_reason
          ) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
          RETURNING *`
        )
        .bind(
          bomLine.product_id,
          input.warehouse_id,
          input.default_position_id,
          variantId,
          bomLine.id,
          bomLine.quantity,
          input.status,
          input.reserved_from,
          input.reserved_until,
          input.reservation_reason,
          input.created_by_user_id
        )
        .first<StockReservationRow>();

      if (!row) {
        throw new Error(`Insert did not return a reservation row for bom_line ${bomLine.id}`);
      }

      createdReservationIds.push(row.id);
    }

    await db.exec("COMMIT");

    return jsonOk(
      {
        data: {
          created_count: createdReservationIds.length,
          skipped_count: skippedBomLineIds.length,
          created_reservation_ids: createdReservationIds,
          skipped_bom_line_ids: skippedBomLineIds,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore rollback errors and preserve the original failure.
    }
    return asSqlFailure(err);
  }
}
