import type {
  DocumentEntityType,
  DocumentGenerationStatus,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const DOCUMENT_ENTITY_TYPES: readonly DocumentEntityType[] = [
  "quote",
  "quote_version",
  "order",
  "payment",
  "installation_job",
  "installation_result",
  "stock_transfer_document",
];

const DOCUMENT_GENERATION_STATUSES: readonly DocumentGenerationStatus[] = [
  "draft",
  "generated",
  "failed",
  "archived",
];

function optionalContent(
  body: JsonObject,
  key: string,
  errors: Failures
): string | null | undefined {
  if (!(key in body) || body[key] === undefined) return undefined;
  if (body[key] === null) return null;
  if (typeof body[key] !== "string") {
    errors.push(`${key} must be a string`);
    return null;
  }
  return body[key] as string;
}

export interface GeneratedDocumentCreateInput {
  template_id: number;
  document_number: string | null;
  title: string;
  entity_type: DocumentEntityType;
  entity_id: number;
  generation_status: DocumentGenerationStatus;
  rendered_content: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  generated_by_user_id: number | null;
  generated_at: string | null;
}

export function parseGeneratedDocumentCreate(
  body: JsonObject,
  errors: Failures
): GeneratedDocumentCreateInput | null {
  const template_id = requirePositiveInt(body, "template_id", errors);
  const document_number = optionalTrimmedString(body, "document_number", errors);
  const title = requireNonEmptyString(body, "title", errors);
  const entity_type = requireEnum(body, "entity_type", DOCUMENT_ENTITY_TYPES, errors);
  const entity_id = requirePositiveInt(body, "entity_id", errors);
  const generation_status = optionalEnum(
    body,
    "generation_status",
    DOCUMENT_GENERATION_STATUSES,
    "draft",
    errors
  );
  const rendered_content = optionalContent(body, "rendered_content", errors);
  const file_url = optionalTrimmedString(body, "file_url", errors);
  const file_name = optionalTrimmedString(body, "file_name", errors);
  const mime_type = optionalTrimmedString(body, "mime_type", errors);
  const generated_by_user_id = optionalNullableFk(body, "generated_by_user_id", errors);
  const generated_at = optionalTrimmedString(body, "generated_at", errors);

  if (
    template_id === null ||
    title === null ||
    entity_type === null ||
    entity_id === null ||
    generation_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    template_id,
    document_number: document_number === undefined ? null : document_number,
    title,
    entity_type,
    entity_id,
    generation_status,
    rendered_content: rendered_content === undefined ? null : rendered_content,
    file_url: file_url === undefined ? null : file_url,
    file_name: file_name === undefined ? null : file_name,
    mime_type: mime_type === undefined ? null : mime_type,
    generated_by_user_id,
    generated_at: generated_at === undefined ? null : generated_at,
  };
}
