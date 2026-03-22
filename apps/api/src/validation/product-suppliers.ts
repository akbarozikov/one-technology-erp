import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalNullableNumber,
  optionalTrimmedString,
  requirePositiveInt,
} from "./helpers";

export interface ProductSupplierCreateInput {
  product_id: number;
  supplier_id: number;
  supplier_sku: string | null;
  purchase_price: number | null;
  currency: string;
  lead_time_days: number | null;
  is_preferred: 0 | 1;
}

export function parseProductSupplierCreate(
  body: JsonObject,
  errors: Failures
): ProductSupplierCreateInput | null {
  const product_id = requirePositiveInt(body, "product_id", errors);
  const supplier_id = requirePositiveInt(body, "supplier_id", errors);
  const supplier_sku = optionalTrimmedString(body, "supplier_sku", errors);
  const purchase_price = optionalNullableNumber(body, "purchase_price", errors);
  let currency = optionalTrimmedString(body, "currency", errors);
  if (currency === undefined || currency === null) {
    currency = "USD";
  }
  const lead_time_days_raw = body["lead_time_days"];
  let lead_time_days: number | null = null;
  if (
    lead_time_days_raw !== undefined &&
    lead_time_days_raw !== null
  ) {
    if (
      typeof lead_time_days_raw === "number" &&
      Number.isInteger(lead_time_days_raw) &&
      lead_time_days_raw >= 0
    ) {
      lead_time_days = lead_time_days_raw;
    } else {
      errors.push("lead_time_days must be a non-negative integer or null");
    }
  }
  const is_preferred = optionalBoolAsInt(body, "is_preferred", 0, errors);

  if (product_id === null || supplier_id === null || errors.length > 0) {
    return null;
  }

  return {
    product_id,
    supplier_id,
    supplier_sku: supplier_sku === undefined ? null : supplier_sku,
    purchase_price:
      purchase_price === undefined ? null : purchase_price === null ? null : purchase_price,
    currency,
    lead_time_days,
    is_preferred,
  };
}
