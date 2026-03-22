import {
  TABLE_DEPARTMENTS,
  TABLE_USERS,
  type EmployeeRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseEmployeeCreate } from "../validation/employees";

export async function handleEmployees(request: Request, env: Env): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM employees ORDER BY id ASC")
      .all<EmployeeRow>();
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
  const input = parseEmployeeCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.user_id);
    if (!ok) {
      return badRequest(`user_id ${input.user_id} not found`);
    }
  }
  if (input.department_id !== null) {
    const ok = await rowExists(db, TABLE_DEPARTMENTS, input.department_id);
    if (!ok) {
      return badRequest(`department_id ${input.department_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO employees (
          user_id, department_id, first_name, last_name, full_name,
          phone, email, job_title, employee_type, hire_date, is_active, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.user_id,
        input.department_id,
        input.first_name,
        input.last_name,
        input.full_name,
        input.phone,
        input.email,
        input.job_title,
        input.employee_type,
        input.hire_date,
        input.is_active,
        input.notes
      )
      .first<EmployeeRow>();
    if (!row) {
      return badRequest("Insert did not return a row");
    }
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
