import {
  TABLE_GENERATED_DOCUMENTS,
  type DocumentLinkRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseDocumentLinkCreate } from "../validation/document-links";

export async function handleDocumentLinks(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM document_links ORDER BY id DESC")
      .all<DocumentLinkRow>();
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
  const input = parseDocumentLinkCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const docOk = await rowExists(db, TABLE_GENERATED_DOCUMENTS, input.generated_document_id);
  if (!docOk) {
    return badRequest(`generated_document_id ${input.generated_document_id} not found`);
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO document_links (
          generated_document_id, entity_type, entity_id, link_role
        ) VALUES (?, ?, ?, ?) RETURNING *`
      )
      .bind(
        input.generated_document_id,
        input.entity_type,
        input.entity_id,
        input.link_role
      )
      .first<DocumentLinkRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
