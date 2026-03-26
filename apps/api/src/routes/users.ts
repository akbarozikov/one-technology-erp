import { ensureAccessBaseline } from "../lib/access-bootstrap";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed, notFound } from "../lib/response";
import type { Env } from "../types/env";
import type { UserPublicRow } from "../types/user-public";
import { parseUserCreate } from "../validation/users";

export async function handleUsers(request: Request, env: Env): Promise<Response> {
  const db = getDb(env);
  await ensureAccessBaseline(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        `SELECT id, email, phone, status, last_login_at, created_at, updated_at
         FROM users ORDER BY id ASC`
      )
      .all<UserPublicRow>();
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
  const input = parseUserCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO users (email, phone, password_hash, status)
         VALUES (?, ?, ?, ?)
         RETURNING id, email, phone, status, last_login_at, created_at, updated_at`
      )
      .bind(input.email, input.phone, input.password_hash, input.status)
      .first<UserPublicRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}

export async function handleUserAction(
  request: Request,
  env: Env,
  userId: number,
  action: "deactivate"
): Promise<Response> {
  if (action !== "deactivate") {
    return notFound();
  }

  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const db = getDb(env);
  const user = await db
    .prepare(
      `SELECT id, email, phone, status, last_login_at, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`
    )
    .bind(userId)
    .first<UserPublicRow>();

  if (!user) {
    return notFound(`user ${userId} not found`);
  }

  if (user.status === "inactive") {
    return jsonOk({
      data: user,
      meta: { lifecycle_action: "deactivate", changed: false },
    });
  }

  try {
    const updated = await db
      .prepare(
        `UPDATE users
         SET status = 'inactive', updated_at = datetime('now')
         WHERE id = ?
         RETURNING id, email, phone, status, last_login_at, created_at, updated_at`
      )
      .bind(userId)
      .first<UserPublicRow>();

    if (!updated) {
      return badRequest("Deactivate did not return a row");
    }

    return jsonOk({
      data: updated,
      meta: { lifecycle_action: "deactivate", changed: true },
    });
  } catch (err) {
    return asSqlFailure(err);
  }
}
