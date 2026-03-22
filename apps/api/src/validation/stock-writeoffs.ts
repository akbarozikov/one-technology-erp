import type {
  WarehouseDocumentStatus,
  WriteoffReason,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const DOCUMENT_STATUSES: readonly WarehouseDocumentStatus[] = [
  "draft",
  "confirmed",
  "cancelled",
];

const WRITEOFF_REASONS: readonly WriteoffReason[] = [
  "damage",
  "loss",
  "defect",
  "expired",
  "other",
];

export interface StockWriteoffCreateInput {
  reference_code: string | null;
  warehouse_id: number;
  writeoff_date: string;
  writeoff_reason: WriteoffReason;
  status: WarehouseDocumentStatus;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parseStockWriteoffCreate(
  body: JsonObject,
  errors: Failures
): StockWriteoffCreateInput | null {
  const reference_code = optionalTrimmedString(body, "reference_code", errors);
  const warehouse_id = requirePositiveInt(body, "warehouse_id", errors);
  const writeoff_date = requireNonEmptyString(body, "writeoff_date", errors);
  const writeoff_reason = requireEnum(
    body,
    "writeoff_reason",
    WRITEOFF_REASONS,
    errors
  );
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
    writeoff_date === null ||
    writeoff_reason === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    reference_code: reference_code === undefined ? null : reference_code,
    warehouse_id,
    writeoff_date,
    writeoff_reason,
    status,
    performed_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
