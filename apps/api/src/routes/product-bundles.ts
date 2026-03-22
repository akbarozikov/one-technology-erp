import { TABLE_PRODUCTS, type ProductBundleRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductBundleCreate } from "../validation/product-bundles";

export async function handleProductBundles(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM product_bundles ORDER BY id ASC")
      .all<ProductBundleRow>();
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
  const input = parseProductBundleCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const prodOk = await rowExists(db, TABLE_PRODUCTS, input.bundle_product_id);
  if (!prodOk) {
    return badRequest(`bundle_product_id ${input.bundle_product_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO product_bundles (
          bundle_product_id, name, code, description, is_active
        ) VALUES (?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.bundle_product_id,
        input.name,
        input.code,
        input.description,
        input.is_active
      )
      .first<ProductBundleRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
