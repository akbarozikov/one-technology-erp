import {
  TABLE_PRODUCT_CATEGORIES,
  type ProductCategoryRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductCategoryCreate } from "../validation/product-categories";

export async function handleProductCategories(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM product_categories ORDER BY id ASC")
      .all<ProductCategoryRow>();
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
  const input = parseProductCategoryCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  if (input.parent_category_id !== null) {
    const ok = await rowExists(
      db,
      TABLE_PRODUCT_CATEGORIES,
      input.parent_category_id
    );
    if (!ok) {
      return badRequest(
        `parent_category_id ${input.parent_category_id} not found`
      );
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO product_categories (
          parent_category_id, name, code, description, is_active
        ) VALUES (?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.parent_category_id,
        input.name,
        input.code,
        input.description,
        input.is_active
      )
      .first<ProductCategoryRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
