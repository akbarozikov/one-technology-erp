import {
  TABLE_PERMISSIONS,
  TABLE_ROLES,
  type RolePermissionRow,
} from "@one-technology/db";
import { ensureAccessBaseline } from "../lib/access-bootstrap";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseRolePermissionCreate } from "../validation/role-permissions";

export async function handleRolePermissions(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);
  await ensureAccessBaseline(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "SELECT * FROM role_permissions ORDER BY role_id ASC, permission_id ASC, id ASC"
      )
      .all<RolePermissionRow>();
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
  const input = parseRolePermissionCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const roleOk = await rowExists(db, TABLE_ROLES, input.role_id);
  if (!roleOk) {
    return badRequest(`role_id ${input.role_id} not found`);
  }

  const permissionOk = await rowExists(db, TABLE_PERMISSIONS, input.permission_id);
  if (!permissionOk) {
    return badRequest(`permission_id ${input.permission_id} not found`);
  }

  const existing = await db
    .prepare(
      "SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1"
    )
    .bind(input.role_id, input.permission_id)
    .first<{ id: number }>();
  if (existing) {
    return badRequest(
      `permission_id ${input.permission_id} is already assigned to role_id ${input.role_id}`
    );
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES (?, ?)
         RETURNING *`
      )
      .bind(input.role_id, input.permission_id)
      .first<RolePermissionRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
