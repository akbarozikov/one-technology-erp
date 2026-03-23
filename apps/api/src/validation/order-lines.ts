import type {
  DiscountType,
  FulfillmentStatus,
  InstallationJobStatus,
  LineType,
  ReservationStatus,
  StockMovementStatus,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requireNonEmptyString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

const LINE_TYPES: readonly LineType[] = [
  "product",
  "bundle",
  "configuration",
  "service",
  "custom",
];

const DISCOUNT_TYPES: readonly DiscountType[] = ["amount", "percent"];

const FULFILLMENT_STATUSES: readonly FulfillmentStatus[] = [
  "pending",
  "reserved",
  "issued",
  "installed",
  "cancelled",
];

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

export interface OrderLineCreateInput {
  order_id: number;
  line_number: number;
  line_type: LineType;
  product_id: number | null;
  configuration_variant_id: number | null;
  quantity: number;
  unit_id: number;
  unit_price: number | null;
  minimum_unit_price: number | null;
  line_discount_type: DiscountType | null;
  line_discount_value: number | null;
  line_discount_total: number | null;
  line_total: number | null;
  fulfillment_status: FulfillmentStatus;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  snapshot_description: string | null;
  notes: string | null;
}

export interface OrderLineActionInput {
  reservation_id: number | null;
  stock_movement_id: number | null;
  installation_job_id: number | null;
  fulfilled_at: string | null;
}

export interface OrderLineProgressInput extends OrderLineActionInput {
  target_status: "reserved" | "issued" | "installed";
  notes: string | null;
}

export function parseOrderLineCreate(
  body: JsonObject,
  errors: Failures
): OrderLineCreateInput | null {
  const order_id = requirePositiveInt(body, "order_id", errors);
  const line_number = requirePositiveInt(body, "line_number", errors);
  const line_type = requireEnum(body, "line_type", LINE_TYPES, errors);
  const product_id = optionalNullableFk(body, "product_id", errors);
  const configuration_variant_id = optionalNullableFk(
    body,
    "configuration_variant_id",
    errors
  );
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const unit_price = optionalNullableNonNegativeNumber(body, "unit_price", errors);
  const minimum_unit_price = optionalNullableNonNegativeNumber(
    body,
    "minimum_unit_price",
    errors
  );
  const line_discount_type = optionalEnum(
    body,
    "line_discount_type",
    DISCOUNT_TYPES,
    "amount",
    errors
  );
  const lineDiscountTypeProvided =
    "line_discount_type" in body &&
    body.line_discount_type !== undefined &&
    body.line_discount_type !== null;
  const line_discount_value = optionalNullableNonNegativeNumber(
    body,
    "line_discount_value",
    errors
  );
  const line_discount_total = optionalNullableNonNegativeNumber(
    body,
    "line_discount_total",
    errors
  );
  const line_total = optionalNullableNonNegativeNumber(body, "line_total", errors);
  const fulfillment_status = optionalEnum(
    body,
    "fulfillment_status",
    FULFILLMENT_STATUSES,
    "pending",
    errors
  );
  const snapshot_product_name = requireNonEmptyString(
    body,
    "snapshot_product_name",
    errors
  );
  const snapshot_sku = requireNonEmptyString(body, "snapshot_sku", errors);
  const snapshot_unit_name = requireNonEmptyString(
    body,
    "snapshot_unit_name",
    errors
  );
  const snapshot_description = optionalTrimmedString(
    body,
    "snapshot_description",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (line_type === "configuration" && configuration_variant_id === null) {
    push(errors, "configuration_variant_id is required when line_type is configuration");
  }

  if (
    order_id === null ||
    line_number === null ||
    line_type === null ||
    quantity === null ||
    unit_id === null ||
    fulfillment_status === null ||
    snapshot_product_name === null ||
    snapshot_sku === null ||
    snapshot_unit_name === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    order_id,
    line_number,
    line_type,
    product_id,
    configuration_variant_id,
    quantity,
    unit_id,
    unit_price: unit_price === undefined ? null : unit_price,
    minimum_unit_price:
      minimum_unit_price === undefined ? null : minimum_unit_price,
    line_discount_type: lineDiscountTypeProvided ? line_discount_type : null,
    line_discount_value:
      line_discount_value === undefined ? null : line_discount_value,
    line_discount_total:
      line_discount_total === undefined ? null : line_discount_total,
    line_total: line_total === undefined ? null : line_total,
    fulfillment_status,
    snapshot_product_name,
    snapshot_sku,
    snapshot_unit_name,
    snapshot_description:
      snapshot_description === undefined ? null : snapshot_description,
    notes: notes === undefined ? null : notes,
  };
}

export function parseOrderLineAction(
  body: JsonObject,
  errors: Failures
): OrderLineActionInput | null {
  const reservation_id = optionalNullableFk(body, "reservation_id", errors);
  const stock_movement_id = optionalNullableFk(body, "stock_movement_id", errors);
  const installation_job_id = optionalNullableFk(body, "installation_job_id", errors);
  const fulfilled_at = optionalTrimmedString(body, "fulfilled_at", errors);

  if (errors.length > 0) {
    return null;
  }

  return {
    reservation_id,
    stock_movement_id,
    installation_job_id,
    fulfilled_at: fulfilled_at === undefined ? null : fulfilled_at,
  };
}

export function parseOrderLineProgress(
  body: JsonObject,
  errors: Failures
): OrderLineProgressInput | null {
  const target_status = requireEnum(
    body,
    "target_status",
    ["reserved", "issued", "installed"] as const,
    errors
  );
  const reservation_id = optionalNullableFk(body, "reservation_id", errors);
  const stock_movement_id = optionalNullableFk(body, "stock_movement_id", errors);
  const installation_job_id = optionalNullableFk(body, "installation_job_id", errors);
  const fulfilled_at = optionalTrimmedString(body, "fulfilled_at", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (target_status === null || errors.length > 0) {
    return null;
  }

  return {
    target_status,
    reservation_id,
    stock_movement_id,
    installation_job_id,
    fulfilled_at: fulfilled_at === undefined ? null : fulfilled_at,
    notes: notes === undefined ? null : notes,
  };
}
