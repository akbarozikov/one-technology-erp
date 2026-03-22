import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  TABLE_PRODUCTS,
  TABLE_UNITS_OF_MEASURE,
  type BomLineRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseBomLineCreate } from "../validation/bom-lines";

export async function handleBomLines(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM bom_lines ORDER BY variant_id DESC, line_number ASC, id ASC")
      .all<BomLineRow>();
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
  const input = parseBomLineCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const variantOk = await rowExists(db, TABLE_DOOR_CONFIGURATION_VARIANTS, input.variant_id);
  if (!variantOk) {
    return badRequest(`variant_id ${input.variant_id} not found`);
  }

  const productOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!productOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }

  const unitOk = await rowExists(db, TABLE_UNITS_OF_MEASURE, input.unit_id);
  if (!unitOk) {
    return badRequest(`unit_id ${input.unit_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO bom_lines (
          variant_id, product_id, source_type, source_reference, line_number,
          quantity, unit_id, waste_factor, unit_cost_snapshot, unit_price_snapshot,
          line_cost_total, line_price_total, snapshot_product_name, snapshot_sku,
          snapshot_unit_name, is_auto_generated, is_manually_edited,
          is_optional, line_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.variant_id,
        input.product_id,
        input.source_type,
        input.source_reference,
        input.line_number,
        input.quantity,
        input.unit_id,
        input.waste_factor,
        input.unit_cost_snapshot,
        input.unit_price_snapshot,
        input.line_cost_total,
        input.line_price_total,
        input.snapshot_product_name,
        input.snapshot_sku,
        input.snapshot_unit_name,
        input.is_auto_generated,
        input.is_manually_edited,
        input.is_optional,
        input.line_status,
        input.notes
      )
      .first<BomLineRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
