import type { PaymentRecordStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

const PAYMENT_RECORD_STATUSES: readonly PaymentRecordStatus[] = [
  "recorded",
  "confirmed",
  "cancelled",
];

export interface PaymentCreateInput {
  order_id: number;
  payment_method_id: number;
  payment_date: string;
  amount: number;
  currency: string;
  reference_number: string | null;
  received_by_user_id: number | null;
  notes: string | null;
  status: PaymentRecordStatus;
}

export function parsePaymentCreate(
  body: JsonObject,
  errors: Failures
): PaymentCreateInput | null {
  const order_id = requirePositiveInt(body, "order_id", errors);
  const payment_method_id = requirePositiveInt(body, "payment_method_id", errors);
  const payment_date = requireNonEmptyString(body, "payment_date", errors);
  const amount = requirePositiveNumber(body, "amount", errors);
  const currency = optionalTrimmedString(body, "currency", errors);
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

  if (
    order_id === null ||
    payment_method_id === null ||
    payment_date === null ||
    amount === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    order_id,
    payment_method_id,
    payment_date,
    amount,
    currency: currency === undefined || currency === null ? "USD" : currency,
    reference_number: reference_number === undefined ? null : reference_number,
    received_by_user_id,
    notes: notes === undefined ? null : notes,
    status,
  };
}
