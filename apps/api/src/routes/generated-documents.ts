import {
  TABLE_DOCUMENT_TEMPLATES,
  TABLE_USERS,
  type GeneratedDocumentRow,
} from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { rowExists } from "../lib/exists";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";
import { parseGeneratedDocumentCreate } from "../validation/generated-documents";

export async function handleGeneratedDocuments(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM generated_documents ORDER BY generated_at DESC, id DESC")
      .all<GeneratedDocumentRow>();
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
  const input = parseGeneratedDocumentCreate(body, errors);
  if (!input || errors.length > 0) {
    return badRequest(errors.length ? errors.join("; ") : "Validation failed");
  }

  const templateOk = await rowExists(db, TABLE_DOCUMENT_TEMPLATES, input.template_id);
  if (!templateOk) {
    return badRequest(`template_id ${input.template_id} not found`);
  }

  if (input.generated_by_user_id !== null) {
    const ok = await rowExists(db, TABLE_USERS, input.generated_by_user_id);
    if (!ok) {
      return badRequest(`generated_by_user_id ${input.generated_by_user_id} not found`);
    }
  }

  try {
    const row = await db
      .prepare(
        `INSERT INTO generated_documents (
          template_id, document_number, title, entity_type, entity_id,
          generation_status, rendered_content, file_url, file_name,
          mime_type, generated_by_user_id, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now'))) RETURNING *`
      )
      .bind(
        input.template_id,
        input.document_number,
        input.title,
        input.entity_type,
        input.entity_id,
        input.generation_status,
        input.rendered_content,
        input.file_url,
        input.file_name,
        input.mime_type,
        input.generated_by_user_id,
        input.generated_at
      )
      .first<GeneratedDocumentRow>();
    if (!row) return badRequest("Insert did not return a row");
    return jsonOk({ data: row }, { status: 201 });
  } catch (err) {
    return asSqlFailure(err);
  }
}
