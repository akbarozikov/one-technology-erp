import type { DiscountType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requirePositiveInt,
} from "./helpers";

const DISCOUNT_TYPES: readonly DiscountType[] = ["amount", "percent"];

function requireEnum<T extends string>(
  body: JsonObject,
  key: string,
  allowed: readonly T[],
  errors: Failures
): T | null {
  const value = body[key];
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    push(errors, `${key} must be one of: ${allowed.join(", ")}`);
    return null;
  }
  return value as T;
}

function requireNonNegativeNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null {
  const value = body[key];
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    push(errors, `${key} is required and must be a non-negative number`);
    return null;
  }
  return value;
}

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

export interface QuoteDiscountCreateInput {
  quote_version_id: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_total: number | null;
  reason: string | null;
  created_by_user_id: number | null;
}

export function parseQuoteDiscountCreate(
  body: JsonObject,
  errors: Failures
): QuoteDiscountCreateInput | null {
  const quote_version_id = requirePositiveInt(body, "quote_version_id", errors);
  const discount_type = requireEnum(body, "discount_type", DISCOUNT_TYPES, errors);
  const discount_value = requireNonNegativeNumber(body, "discount_value", errors);
  const discount_total = optionalNullableNonNegativeNumber(
    body,
    "discount_total",
    errors
  );
  const reason = optionalTrimmedString(body, "reason", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);

  if (
    quote_version_id === null ||
    discount_type === null ||
    discount_value === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    quote_version_id,
    discount_type,
    discount_value,
    discount_total: discount_total === undefined ? null : discount_total,
    reason: reason === undefined ? null : reason,
    created_by_user_id,
  };
}
