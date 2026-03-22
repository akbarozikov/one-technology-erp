import type {
  CommercialReservationStatus,
  FulfillmentType,
  OrderPaymentStatus,
  OrderStatus,
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
  requireNonEmptyString,
} from "./helpers";

const FULFILLMENT_TYPES: readonly FulfillmentType[] = [
  "installation",
  "pickup",
  "delivery_without_installation",
];

const ORDER_STATUSES: readonly OrderStatus[] = [
  "draft",
  "reserved",
  "awaiting_payment",
  "partially_paid",
  "ready_for_fulfillment",
  "scheduled_installation",
  "fulfilled",
  "completed",
  "cancelled",
];

const ORDER_PAYMENT_STATUSES: readonly OrderPaymentStatus[] = [
  "unpaid",
  "partially_paid",
  "paid",
  "refunded",
];

const COMMERCIAL_RESERVATION_STATUSES: readonly CommercialReservationStatus[] = [
  "none",
  "partially_reserved",
  "fully_reserved",
  "released",
  "consumed",
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

export interface OrderCreateInput {
  quote_version_id: number | null;
  customer_id: number | null;
  deal_id: number | null;
  order_number: string;
  installation_required: 0 | 1;
  fulfillment_type: FulfillmentType;
  order_status: OrderStatus;
  payment_status: OrderPaymentStatus;
  reservation_status: CommercialReservationStatus;
  currency: string;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  paid_total: number | null;
  remaining_total: number | null;
  order_date: string | null;
  planned_installation_date: string | null;
  completed_at: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parseOrderCreate(
  body: JsonObject,
  errors: Failures
): OrderCreateInput | null {
  const quote_version_id = optionalNullableFk(body, "quote_version_id", errors);
  const customer_id = optionalNullableFk(body, "customer_id", errors);
  const deal_id = optionalNullableFk(body, "deal_id", errors);
  const order_number = requireNonEmptyString(body, "order_number", errors);
  const installation_required = optionalBoolAsInt(
    body,
    "installation_required",
    0,
    errors
  );
  const fulfillment_type = optionalEnum(
    body,
    "fulfillment_type",
    FULFILLMENT_TYPES,
    "installation",
    errors
  );
  const order_status = optionalEnum(
    body,
    "order_status",
    ORDER_STATUSES,
    "draft",
    errors
  );
  const payment_status = optionalEnum(
    body,
    "payment_status",
    ORDER_PAYMENT_STATUSES,
    "unpaid",
    errors
  );
  const reservation_status = optionalEnum(
    body,
    "reservation_status",
    COMMERCIAL_RESERVATION_STATUSES,
    "none",
    errors
  );
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
  const paid_total = optionalNullableNonNegativeNumber(body, "paid_total", errors);
  const remaining_total = optionalNullableNonNegativeNumber(
    body,
    "remaining_total",
    errors
  );
  const order_date = optionalTrimmedString(body, "order_date", errors);
  const planned_installation_date = optionalTrimmedString(
    body,
    "planned_installation_date",
    errors
  );
  const completed_at = optionalTrimmedString(body, "completed_at", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const approved_by_user_id = optionalNullableFk(body, "approved_by_user_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    order_number === null ||
    fulfillment_type === null ||
    order_status === null ||
    payment_status === null ||
    reservation_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    quote_version_id,
    customer_id,
    deal_id,
    order_number,
    installation_required,
    fulfillment_type,
    order_status,
    payment_status,
    reservation_status,
    currency: currency === undefined || currency === null ? "USD" : currency,
    minimum_sale_total: minimum_sale_total === undefined ? null : minimum_sale_total,
    actual_sale_total: actual_sale_total === undefined ? null : actual_sale_total,
    discount_total: discount_total === undefined ? null : discount_total,
    grand_total: grand_total === undefined ? null : grand_total,
    paid_total: paid_total === undefined ? null : paid_total,
    remaining_total: remaining_total === undefined ? null : remaining_total,
    order_date: order_date === undefined ? null : order_date,
    planned_installation_date:
      planned_installation_date === undefined ? null : planned_installation_date,
    completed_at: completed_at === undefined ? null : completed_at,
    created_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
