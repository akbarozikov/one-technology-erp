import {
  TABLE_USERS,
  type DoorConfigurationRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseDoorConfigurationCreate } from "../validation/door-configurations";

export async function handleDoorConfigurations(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM door_configurations ORDER BY created_at DESC, id DESC")
      .all<DoorConfigurationRow>();
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
  const input = parseDoorConfigurationCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
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
        `INSERT INTO door_configurations (
          configuration_code, title, customer_id, deal_id, created_by_user_id,
          status, is_attached_to_quote, is_attached_to_order,
          selected_variant_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.configuration_code,
        input.title,
        input.customer_id,
        input.deal_id,
        input.created_by_user_id,
        input.status,
        input.is_attached_to_quote,
        input.is_attached_to_order,
        input.selected_variant_id,
        input.notes
      )
      .first<DoorConfigurationRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
