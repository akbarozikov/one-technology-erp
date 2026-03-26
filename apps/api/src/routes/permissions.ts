import type { PermissionRow } from "@one-technology/db";
import { ensureAccessBaseline } from "../lib/access-bootstrap";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parsePermissionCreate } from "../validation/permissions";

export async function handlePermissions(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);
  await ensureAccessBaseline(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM permissions ORDER BY id ASC")
      .all<PermissionRow>();
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
  const input = parsePermissionCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO permissions (name, code, module, description)
         VALUES (?, ?, ?, ?) RETURNING *`
      )
      .bind(input.name, input.code, input.module, input.description)
      .first<PermissionRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
