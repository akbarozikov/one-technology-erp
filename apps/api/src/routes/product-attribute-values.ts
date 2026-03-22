import {
  TABLE_PRODUCT_ATTRIBUTES,
  TABLE_PRODUCTS,
  type ProductAttributeValueRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseProductAttributeValueCreate } from "../validation/product-attribute-values";

export async function handleProductAttributeValues(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM product_attribute_values ORDER BY id ASC")
      .all<ProductAttributeValueRow>();
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
  const input = parseProductAttributeValueCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const pOk = await rowExists(db, TABLE_PRODUCTS, input.product_id);
  if (!pOk) {
    return badRequest(`product_id ${input.product_id} not found`);
  }
  const aOk = await rowExists(
    db,
    TABLE_PRODUCT_ATTRIBUTES,
    input.attribute_id
  );
  if (!aOk) {
    return badRequest(`attribute_id ${input.attribute_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO product_attribute_values (
          product_id, attribute_id, value_text, value_number, value_boolean, value_json
        ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.product_id,
        input.attribute_id,
        input.value_text,
        input.value_number,
        input.value_boolean,
        input.value_json
      )
      .first<ProductAttributeValueRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
