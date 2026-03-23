import type {
  DocumentEntityType,
  DocumentLinkRole,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  requireEnum,
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

const DOCUMENT_LINK_ROLES: readonly DocumentLinkRole[] = [
  "primary",
  "supporting",
  "derived_from",
  "related",
];

export interface DocumentLinkCreateInput {
  generated_document_id: number;
  entity_type: DocumentEntityType;
  entity_id: number;
  link_role: DocumentLinkRole;
}

export function parseDocumentLinkCreate(
  body: JsonObject,
  errors: Failures
): DocumentLinkCreateInput | null {
  const generated_document_id = requirePositiveInt(body, "generated_document_id", errors);
  const entity_type = requireEnum(body, "entity_type", DOCUMENT_ENTITY_TYPES, errors);
  const entity_id = requirePositiveInt(body, "entity_id", errors);
  const link_role = requireEnum(body, "link_role", DOCUMENT_LINK_ROLES, errors);

  if (
    generated_document_id === null ||
    entity_type === null ||
    entity_id === null ||
    link_role === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    generated_document_id,
    entity_type,
    entity_id,
    link_role,
  };
}
