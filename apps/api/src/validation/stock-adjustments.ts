import type { WarehouseDocumentStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const DOCUMENT_STATUSES: readonly WarehouseDocumentStatus[] = [
  "draft",
  "confirmed",
  "cancelled",
];

export interface StockAdjustmentCreateInput {
  reference_code: string | null;
  warehouse_id: number;
  adjustment_date: string;
  reason: string;
  status: WarehouseDocumentStatus;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parseStockAdjustmentCreate(
  body: JsonObject,
  errors: Failures
): StockAdjustmentCreateInput | null {
  const reference_code = optionalTrimmedString(body, "reference_code", errors);
  const warehouse_id = requirePositiveInt(body, "warehouse_id", errors);
  const adjustment_date = requireNonEmptyString(body, "adjustment_date", errors);
  const reasonRaw = optionalTrimmedString(body, "reason", errors);
  const status = optionalEnum(body, "status", DOCUMENT_STATUSES, "draft", errors);
  const performed_by_user_id = optionalNullableFk(
    body,
    "performed_by_user_id",
    errors
  );
  const approved_by_user_id = optionalNullableFk(
    body,
    "approved_by_user_id",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    warehouse_id === null ||
    adjustment_date === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    reference_code: reference_code === undefined ? null : reference_code,
    warehouse_id,
    adjustment_date,
    reason: reasonRaw === undefined || reasonRaw === null ? "" : reasonRaw,
    status,
    performed_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
