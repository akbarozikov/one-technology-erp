import {
  TABLE_DOOR_CONFIGURATION_VARIANTS,
  type ConfigurationVisualRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseConfigurationVisualCreate } from "../validation/configuration-visuals";

export async function handleConfigurationVisuals(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM configuration_visuals ORDER BY variant_id DESC, id DESC")
      .all<ConfigurationVisualRow>();
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
  const input = parseConfigurationVisualCreate(body, errors);
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
        `INSERT INTO configuration_visuals (
          variant_id, visual_type, file_url, preview_url, render_version, notes
        ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.variant_id,
        input.visual_type,
        input.file_url,
        input.preview_url,
        input.render_version,
        input.notes
      )
      .first<ConfigurationVisualRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
