import type {
  DocumentEntityType,
  DocumentOutputFormat,
  DocumentTemplateType,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const DOCUMENT_TEMPLATE_TYPES: readonly DocumentTemplateType[] = [
  "quote",
  "order",
  "payment",
  "installation",
  "service",
  "internal",
];

const DOCUMENT_ENTITY_TYPES: readonly DocumentEntityType[] = [
  "quote",
  "quote_version",
  "order",
  "payment",
  "installation_job",
  "installation_result",
  "stock_transfer_document",
];

const DOCUMENT_OUTPUT_FORMATS: readonly DocumentOutputFormat[] = ["html", "pdf", "docx"];

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

export interface DocumentTemplateCreateInput {
  name: string;
  code: string;
  template_type: DocumentTemplateType;
  entity_type: DocumentEntityType;
  description: string | null;
  template_content: string | null;
  output_format: DocumentOutputFormat;
  is_active: 0 | 1;
  created_by_user_id: number | null;
}

export function parseDocumentTemplateCreate(
  body: JsonObject,
  errors: Failures
): DocumentTemplateCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const template_type = requireEnum(
    body,
    "template_type",
    DOCUMENT_TEMPLATE_TYPES,
    errors
  );
  const entity_type = requireEnum(body, "entity_type", DOCUMENT_ENTITY_TYPES, errors);
  const description = optionalTrimmedString(body, "description", errors);
  const template_content = optionalContent(body, "template_content", errors);
  const output_format = requireEnum(
    body,
    "output_format",
    DOCUMENT_OUTPUT_FORMATS,
    errors
  );
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);

  if (
    name === null ||
    code === null ||
    template_type === null ||
    entity_type === null ||
    output_format === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    name,
    code,
    template_type,
    entity_type,
    description: description === undefined ? null : description,
    template_content: template_content === undefined ? null : template_content,
    output_format,
    is_active,
    created_by_user_id,
  };
}
