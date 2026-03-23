import type {
  CommercialReservationStatus,
  DocumentEntityType,
  DocumentTemplateType,
  FulfillmentType,
  OrderPaymentStatus,
  OrderStatus,
  PaymentRecordStatus,
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
  requirePositiveInt,
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

const PAYMENT_RECORD_STATUSES: readonly PaymentRecordStatus[] = [
  "recorded",
  "confirmed",
  "cancelled",
];

const COMMERCIAL_RESERVATION_STATUSES: readonly CommercialReservationStatus[] = [
  "none",
  "partially_reserved",
  "fully_reserved",
  "released",
  "consumed",
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

export interface OrderGenerateDocumentInput {
  template_id: number;
  document_number: string | null;
  title: string | null;
  generated_by_user_id: number | null;
  create_order_link: 0 | 1;
}

export interface OrderCreatePaymentRecordInput {
  payment_method_id: number;
  amount: number | null;
  payment_date: string | null;
  reference_number: string | null;
  received_by_user_id: number | null;
  notes: string | null;
  status: PaymentRecordStatus;
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

export function parseOrderGenerateDocument(
  body: JsonObject,
  errors: Failures
): OrderGenerateDocumentInput | null {
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
  const create_order_link = optionalBoolAsInt(body, "create_order_link", 0, errors);

  if (template_id === null || errors.length > 0) {
    return null;
  }

  return {
    template_id,
    document_number: document_number === undefined ? null : document_number,
    title: title === undefined ? null : title,
    generated_by_user_id,
    create_order_link,
  };
}

export function parseOrderCreatePaymentRecord(
  body: JsonObject,
  errors: Failures
): OrderCreatePaymentRecordInput | null {
  const payment_method_id = requirePositiveInt(body, "payment_method_id", errors);
  const amountValue = optionalNullableNumber(body, "amount", errors);
  if (amountValue !== undefined && amountValue !== null && amountValue <= 0) {
    push(errors, "amount must be a positive number when provided");
  }

  const payment_date = optionalTrimmedString(body, "payment_date", errors);
  const reference_number = optionalTrimmedString(body, "reference_number", errors);
  const received_by_user_id = optionalNullableFk(body, "received_by_user_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const status = optionalEnum(
    body,
    "status",
    PAYMENT_RECORD_STATUSES,
    "recorded",
    errors
  );

  if (payment_method_id === null || status === null || errors.length > 0) {
    return null;
  }

  return {
    payment_method_id,
    amount: amountValue === undefined ? null : amountValue,
    payment_date: payment_date === undefined ? null : payment_date,
    reference_number: reference_number === undefined ? null : reference_number,
    received_by_user_id,
    notes: notes === undefined ? null : notes,
    status,
  };
}

void DOCUMENT_TEMPLATE_TYPES;
void DOCUMENT_ENTITY_TYPES;
