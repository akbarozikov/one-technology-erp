import { TABLE_BRANCHES, type LocationRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseLocationCreate } from "../validation/locations";

export async function handleLocations(request: Request, env: Env): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM locations ORDER BY id ASC")
      .all<LocationRow>();
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
  const input = parseLocationCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const branchOk = await rowExists(db, TABLE_BRANCHES, input.branch_id);
  if (!branchOk) {
    return badRequest(`branch_id ${input.branch_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO locations (
          branch_id, name, code, location_type, address_text, city, country, is_active, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.branch_id,
        input.name,
        input.code,
        input.location_type,
        input.address_text,
        input.city,
        input.country,
        input.is_active,
        input.notes
      )
      .first<LocationRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
