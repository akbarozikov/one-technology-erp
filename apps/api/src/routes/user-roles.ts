import {
  TABLE_ROLES,
  TABLE_USERS,
  type UserRoleRow,
} from "@one-technology/db";
import { ensureAccessBaseline } from "../lib/access-bootstrap";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseUserRoleCreate } from "../validation/user-roles";

export async function handleUserRoles(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);
  await ensureAccessBaseline(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM user_roles ORDER BY user_id ASC, role_id ASC, id ASC")
      .all<UserRoleRow>();
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
  const input = parseUserRoleCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const userOk = await rowExists(db, TABLE_USERS, input.user_id);
  if (!userOk) {
    return badRequest(`user_id ${input.user_id} not found`);
  }

  const roleOk = await rowExists(db, TABLE_ROLES, input.role_id);
  if (!roleOk) {
    return badRequest(`role_id ${input.role_id} not found`);
  }

  const existing = await db
    .prepare(
      "SELECT id FROM user_roles WHERE user_id = ? AND role_id = ? LIMIT 1"
    )
    .bind(input.user_id, input.role_id)
    .first<{ id: number }>();
  if (existing) {
    return badRequest(
      `user_id ${input.user_id} is already assigned to role_id ${input.role_id}`
    );
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES (?, ?)
         RETURNING *`
      )
      .bind(input.user_id, input.role_id)
      .first<UserRoleRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
