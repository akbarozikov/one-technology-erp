import type { WarehouseDocumentStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const DOCUMENT_STATUSES: readonly WarehouseDocumentStatus[] = [
  "draft",
  "confirmed",
  "cancelled",
];

export interface PurchaseReceiptCreateInput {
  receipt_number: string | null;
  supplier_id: number;
  destination_warehouse_id: number;
  receipt_date: string;
  status: WarehouseDocumentStatus;
  source_document_number: string | null;
  currency: string;
  total_amount: number | null;
  received_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parsePurchaseReceiptCreate(
  body: JsonObject,
  errors: Failures
): PurchaseReceiptCreateInput | null {
  const receipt_number = optionalTrimmedString(body, "receipt_number", errors);
  const supplier_id = requirePositiveInt(body, "supplier_id", errors);
  const destination_warehouse_id = requirePositiveInt(
    body,
    "destination_warehouse_id",
    errors
  );
  const receipt_date = requireNonEmptyString(body, "receipt_date", errors);
  const status = optionalEnum(body, "status", DOCUMENT_STATUSES, "draft", errors);
  const source_document_number = optionalTrimmedString(
    body,
    "source_document_number",
    errors
  );
  let currency = optionalTrimmedString(body, "currency", errors);
  if (currency === undefined || currency === null) {
    currency = "USD";
  }
  const total_amount = optionalNullableNumber(body, "total_amount", errors);
  if (typeof total_amount === "number" && total_amount < 0) {
    errors.push("total_amount must be a non-negative number or null");
  }
  const received_by_user_id = optionalNullableFk(body, "received_by_user_id", errors);
  const approved_by_user_id = optionalNullableFk(body, "approved_by_user_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    supplier_id === null ||
    destination_warehouse_id === null ||
    receipt_date === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    receipt_number: receipt_number === undefined ? null : receipt_number,
    supplier_id,
    destination_warehouse_id,
    receipt_date,
    status,
    source_document_number:
      source_document_number === undefined ? null : source_document_number,
    currency,
    total_amount: total_amount === undefined ? null : total_amount,
    received_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
