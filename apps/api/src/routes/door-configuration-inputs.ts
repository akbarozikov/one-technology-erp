import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  type DoorConfigurationInputRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseDoorConfigurationInputCreate } from "../validation/door-configuration-inputs";

export async function handleDoorConfigurationInputs(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM door_configuration_inputs ORDER BY variant_id DESC, sort_order ASC, id ASC"
      )
      .all<DoorConfigurationInputRow>();
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
  const input = parseDoorConfigurationInputCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const variantOk = await rowExists(db, TABLE_DOOR_CONFIGURATION_VARIANTS, input.variant_id);
  if (!variantOk) {
    return badRequest(`variant_id ${input.variant_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO door_configuration_inputs (
          variant_id, input_key, input_label, input_type, value_text,
          value_number, value_boolean, value_json, unit_hint, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.variant_id,
        input.input_key,
        input.input_label,
        input.input_type,
        input.value_text,
        input.value_number,
        input.value_boolean,
        input.value_json,
        input.unit_hint,
        input.sort_order
      )
      .first<DoorConfigurationInputRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
