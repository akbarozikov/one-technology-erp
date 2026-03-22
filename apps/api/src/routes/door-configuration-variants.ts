import {
  TABLE_DOOR_CONFIGURATIONS,
  TABLE_USERS,
  type DoorConfigurationVariantRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseDoorConfigurationVariantCreate } from "../validation/door-configuration-variants";

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
