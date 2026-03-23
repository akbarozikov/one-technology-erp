import type { ReservationStatus, VariantStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const VARIANT_STATUSES: readonly VariantStatus[] = [
  "draft",
  "calculated",
  "priced",
  "quoted",
  "accepted",
  "cancelled",
];

const RESERVATION_STATUSES: readonly ReservationStatus[] = [
  "active",
  "released",
  "consumed",
  "cancelled",
];

function optionalNullableNonNegativeInteger(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return undefined;
  }
  const value = body[key];
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
    push(errors, `${key} must be a non-negative integer`);
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

export interface DoorConfigurationVariantCreateInput {
  configuration_id: number;
  variant_number: number;
  name: string;
  description: string | null;
  is_current: 0 | 1;
  is_selected: 0 | 1;
  variant_status: VariantStatus;
  quote_line_id: number | null;
  order_line_id: number | null;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  bom_total_cost: number | null;
  bom_total_items: number | null;
  created_by_user_id: number | null;
}

export interface DoorConfigurationVariantCreateReservationDraftInput {
  warehouse_id: number;
  default_position_id: number;
  created_by_user_id: number | null;
  reservation_reason: string | null;
  reserved_from: string | null;
  reserved_until: string | null;
  status: ReservationStatus;
  include_optional: 0 | 1;
}

export function parseDoorConfigurationVariantCreate(
  body: JsonObject,
  errors: Failures
): DoorConfigurationVariantCreateInput | null {
  const configuration_id = requirePositiveInt(body, "configuration_id", errors);
  const variant_number = requirePositiveInt(body, "variant_number", errors);
  const name = requireNonEmptyString(body, "name", errors);
  const description = optionalTrimmedString(body, "description", errors);
  const is_current = optionalBoolAsInt(body, "is_current", 1, errors);
  const is_selected = optionalBoolAsInt(body, "is_selected", 0, errors);
  const variant_status = optionalEnum(
    body,
    "variant_status",
    VARIANT_STATUSES,
    "draft",
    errors
  );
  const quote_line_id = optionalNullableFk(body, "quote_line_id", errors);
  const order_line_id = optionalNullableFk(body, "order_line_id", errors);
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
  const bom_total_cost = optionalNullableNonNegativeNumber(body, "bom_total_cost", errors);
  const bom_total_items = optionalNullableNonNegativeInteger(
    body,
    "bom_total_items",
    errors
  );
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);

  if (
    configuration_id === null ||
    variant_number === null ||
    name === null ||
    variant_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    configuration_id,
    variant_number,
    name,
    description: description === undefined ? null : description,
    is_current,
    is_selected,
    variant_status,
    quote_line_id,
    order_line_id,
    minimum_sale_total:
      minimum_sale_total === undefined ? null : minimum_sale_total,
    actual_sale_total: actual_sale_total === undefined ? null : actual_sale_total,
    bom_total_cost: bom_total_cost === undefined ? null : bom_total_cost,
    bom_total_items: bom_total_items === undefined ? null : bom_total_items,
    created_by_user_id,
  };
}

export function parseDoorConfigurationVariantCreateReservationDraft(
  body: JsonObject,
  errors: Failures
): DoorConfigurationVariantCreateReservationDraftInput | null {
  const warehouse_id = requirePositiveInt(body, "warehouse_id", errors);
  const default_position_id = requirePositiveInt(body, "default_position_id", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const reservation_reason = optionalTrimmedString(body, "reservation_reason", errors);
  const reserved_from = optionalTrimmedString(body, "reserved_from", errors);
  const reserved_until = optionalTrimmedString(body, "reserved_until", errors);
  const status = optionalEnum(
    body,
    "status",
    RESERVATION_STATUSES,
    "active",
    errors
  );
  const include_optional = optionalBoolAsInt(body, "include_optional", 0, errors);

  if (
    warehouse_id === null ||
    default_position_id === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    warehouse_id,
    default_position_id,
    created_by_user_id,
    reservation_reason:
      reservation_reason === undefined ? null : reservation_reason,
    reserved_from: reserved_from === undefined ? null : reserved_from,
    reserved_until: reserved_until === undefined ? null : reserved_until,
    status,
    include_optional,
  };
}
