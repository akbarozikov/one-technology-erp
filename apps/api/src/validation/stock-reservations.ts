import type { ReservationStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

const RESERVATION_STATUSES: readonly ReservationStatus[] = [
  "active",
  "released",
  "consumed",
  "cancelled",
];

export interface StockReservationCreateInput {
  product_id: number;
  warehouse_id: number;
  position_id: number;
  quote_line_id: number | null;
  order_line_id: number | null;
  configuration_variant_id: number | null;
  bom_line_id: number | null;
  reserved_qty: number;
  status: ReservationStatus;
  reserved_from: string | null;
  reserved_until: string | null;
  reservation_reason: string | null;
  created_by_user_id: number | null;
  released_by_user_id: number | null;
  release_reason: string | null;
}

export function parseStockReservationCreate(
  body: JsonObject,
  errors: Failures
): StockReservationCreateInput | null {
  const product_id = requirePositiveInt(body, "product_id", errors);
  const warehouse_id = requirePositiveInt(body, "warehouse_id", errors);
  const position_id = requirePositiveInt(body, "position_id", errors);
  const quote_line_id = optionalNullableFk(body, "quote_line_id", errors);
  const order_line_id = optionalNullableFk(body, "order_line_id", errors);
  const configuration_variant_id = optionalNullableFk(
    body,
    "configuration_variant_id",
    errors
  );
  const bom_line_id = optionalNullableFk(body, "bom_line_id", errors);
  const reserved_qty = requirePositiveNumber(body, "reserved_qty", errors);
  const status = optionalEnum(
    body,
    "status",
    RESERVATION_STATUSES,
    "active",
    errors
  );
  const reserved_from = optionalTrimmedString(body, "reserved_from", errors);
  const reserved_until = optionalTrimmedString(body, "reserved_until", errors);
  const reservation_reason = optionalTrimmedString(
    body,
    "reservation_reason",
    errors
  );
  const created_by_user_id = optionalNullableFk(
    body,
    "created_by_user_id",
    errors
  );
  const released_by_user_id = optionalNullableFk(
    body,
    "released_by_user_id",
    errors
  );
  const release_reason = optionalTrimmedString(body, "release_reason", errors);

  if (
    product_id === null ||
    warehouse_id === null ||
    position_id === null ||
    reserved_qty === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    product_id,
    warehouse_id,
    position_id,
    quote_line_id,
    order_line_id,
    configuration_variant_id,
    bom_line_id,
    reserved_qty,
    status,
    reserved_from: reserved_from === undefined ? null : reserved_from,
    reserved_until: reserved_until === undefined ? null : reserved_until,
    reservation_reason:
      reservation_reason === undefined ? null : reservation_reason,
    created_by_user_id,
    released_by_user_id,
    release_reason: release_reason === undefined ? null : release_reason,
  };
}
