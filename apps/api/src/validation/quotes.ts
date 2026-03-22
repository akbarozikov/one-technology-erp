import type { QuoteStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requireNonEmptyString,
} from "./helpers";

const QUOTE_STATUSES: readonly QuoteStatus[] = [
  "draft",
  "active",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
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

export interface QuoteCreateInput {
  deal_id: number | null;
  quote_number: string;
  status: QuoteStatus;
  currency: string;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  valid_until: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parseQuoteCreate(
  body: JsonObject,
  errors: Failures
): QuoteCreateInput | null {
  const deal_id = optionalNullableFk(body, "deal_id", errors);
  const quote_number = requireNonEmptyString(body, "quote_number", errors);
  const status = optionalEnum(body, "status", QUOTE_STATUSES, "draft", errors);
  const currency = optionalTrimmedString(body, "currency", errors);
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
  const valid_until = optionalTrimmedString(body, "valid_until", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const approved_by_user_id = optionalNullableFk(body, "approved_by_user_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (quote_number === null || status === null || errors.length > 0) {
    return null;
  }

  return {
    deal_id,
    quote_number,
    status,
    currency: currency === undefined || currency === null ? "USD" : currency,
    minimum_sale_total: minimum_sale_total === undefined ? null : minimum_sale_total,
    actual_sale_total: actual_sale_total === undefined ? null : actual_sale_total,
    discount_total: discount_total === undefined ? null : discount_total,
    grand_total: grand_total === undefined ? null : grand_total,
    valid_until: valid_until === undefined ? null : valid_until,
    created_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
