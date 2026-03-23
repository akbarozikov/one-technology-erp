import type {
  DocumentLinkRole,
  DocumentTemplateType,
  DocumentEntityType,
  FulfillmentType,
  CommercialReservationStatus,
  QuoteVersionStatus,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requirePositiveInt,
} from "./helpers";

const QUOTE_VERSION_STATUSES: readonly QuoteVersionStatus[] = [
  "draft",
  "prepared",
  "sent",
  "accepted",
  "rejected",
  "superseded",
  "cancelled",
];

const COMMERCIAL_RESERVATION_STATUSES: readonly CommercialReservationStatus[] = [
  "none",
  "partially_reserved",
  "fully_reserved",
  "released",
  "consumed",
];

const FULFILLMENT_TYPES: readonly FulfillmentType[] = [
  "installation",
  "pickup",
  "delivery_without_installation",
];

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

const DOCUMENT_LINK_ROLES: readonly DocumentLinkRole[] = [
  "primary",
  "supporting",
  "derived_from",
  "related",
];

function optionalNullableNonNegativeNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  const value = optionalNullableNumber(body, key, errors);
  if (value === undefined || value === null) return value;
  if (value < 0) {
    push(errors, `${key} must be a non-negative number`);
    return null;
  }
  return value;
}

export interface QuoteVersionCreateInput {
  quote_id: number;
  version_number: number;
  version_status: QuoteVersionStatus;
  is_current: 0 | 1;
  based_on_version_id: number | null;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  reservation_status: CommercialReservationStatus;
  notes: string | null;
  created_by_user_id: number | null;
}

export interface QuoteVersionCreateOrderDraftInput {
  order_number: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  order_date: string | null;
  planned_installation_date: string | null;
  installation_required: 0 | 1;
  notes: string | null;
  fulfillment_type: FulfillmentType;
}

export interface QuoteVersionGenerateDocumentInput {
  template_id: number;
  document_number: string | null;
  title: string | null;
  generated_by_user_id: number | null;
  create_quote_link: 0 | 1;
}

export function parseQuoteVersionCreate(
  body: JsonObject,
  errors: Failures
): QuoteVersionCreateInput | null {
  const quote_id = requirePositiveInt(body, "quote_id", errors);
  const version_number = requirePositiveInt(body, "version_number", errors);
  const version_status = optionalEnum(
    body,
    "version_status",
    QUOTE_VERSION_STATUSES,
    "draft",
    errors
  );
  const is_current = optionalBoolAsInt(body, "is_current", 1, errors);
  const based_on_version_id = optionalNullableFk(body, "based_on_version_id", errors);
  const minimum_sale_total = optionalNullableNonNegativeNumber(
    body,
    "minimum_sale_total",
    errors
  );
  const actual_sale_total = optionalNullableNonNegativeNumber(
    body,
    "actual_sale_total",
    errors
  );
  const discount_total = optionalNullableNonNegativeNumber(
    body,
    "discount_total",
    errors
  );
  const grand_total = optionalNullableNonNegativeNumber(body, "grand_total", errors);
  const reservation_status = optionalEnum(
    body,
    "reservation_status",
    COMMERCIAL_RESERVATION_STATUSES,
    "none",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);

  if (
    quote_id === null ||
    version_number === null ||
    version_status === null ||
    reservation_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    quote_id,
    version_number,
    version_status,
    is_current,
    based_on_version_id,
    minimum_sale_total: minimum_sale_total === undefined ? null : minimum_sale_total,
    actual_sale_total: actual_sale_total === undefined ? null : actual_sale_total,
    discount_total: discount_total === undefined ? null : discount_total,
    grand_total: grand_total === undefined ? null : grand_total,
    reservation_status,
    notes: notes === undefined ? null : notes,
    created_by_user_id,
  };
}

export function parseQuoteVersionCreateOrderDraft(
  body: JsonObject,
  errors: Failures
): QuoteVersionCreateOrderDraftInput | null {
  const order_number = optionalTrimmedString(body, "order_number", errors);
  if ("order_number" in body && order_number === null) {
    push(errors, "order_number must be a non-empty string when provided");
  }

  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const approved_by_user_id = optionalNullableFk(body, "approved_by_user_id", errors);
  const order_date = optionalTrimmedString(body, "order_date", errors);
  const planned_installation_date = optionalTrimmedString(
    body,
    "planned_installation_date",
    errors
  );
  const installation_required = optionalBoolAsInt(
    body,
    "installation_required",
    0,
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);
  const fulfillment_type = optionalEnum(
    body,
    "fulfillment_type",
    FULFILLMENT_TYPES,
    "installation",
    errors
  );

  if (fulfillment_type === null || errors.length > 0) {
    return null;
  }

  return {
    order_number: order_number === undefined ? null : order_number,
    created_by_user_id,
    approved_by_user_id,
    order_date: order_date === undefined ? null : order_date,
    planned_installation_date:
      planned_installation_date === undefined ? null : planned_installation_date,
    installation_required,
    notes: notes === undefined ? null : notes,
    fulfillment_type,
  };
}

export function parseQuoteVersionGenerateDocument(
  body: JsonObject,
  errors: Failures
): QuoteVersionGenerateDocumentInput | null {
  const template_id = requirePositiveInt(body, "template_id", errors);
  const document_number = optionalTrimmedString(body, "document_number", errors);
  if ("document_number" in body && document_number === null) {
    push(errors, "document_number must be a non-empty string when provided");
  }

  const title = optionalTrimmedString(body, "title", errors);
  if ("title" in body && title === null) {
    push(errors, "title must be a non-empty string when provided");
  }

  const generated_by_user_id = optionalNullableFk(body, "generated_by_user_id", errors);
  const create_quote_link = optionalBoolAsInt(body, "create_quote_link", 1, errors);

  if (template_id === null || errors.length > 0) {
    return null;
  }

  return {
    template_id,
    document_number: document_number === undefined ? null : document_number,
    title: title === undefined ? null : title,
    generated_by_user_id,
    create_quote_link,
  };
}

void DOCUMENT_TEMPLATE_TYPES;
void DOCUMENT_ENTITY_TYPES;
void DOCUMENT_LINK_ROLES;
