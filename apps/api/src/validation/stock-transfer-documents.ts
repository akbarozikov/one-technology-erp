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

export interface StockTransferDocumentCreateInput {
  reference_code: string | null;
  source_warehouse_id: number;
  destination_warehouse_id: number;
  transfer_date: string;
  status: WarehouseDocumentStatus;
  requested_by_user_id: number | null;
  confirmed_by_user_id: number | null;
  notes: string | null;
}

export function parseStockTransferDocumentCreate(
  body: JsonObject,
  errors: Failures
): StockTransferDocumentCreateInput | null {
  const reference_code = optionalTrimmedString(body, "reference_code", errors);
  const source_warehouse_id = requirePositiveInt(
    body,
    "source_warehouse_id",
    errors
  );
  const destination_warehouse_id = requirePositiveInt(
    body,
    "destination_warehouse_id",
    errors
  );
  const transfer_date = requireNonEmptyString(body, "transfer_date", errors);
  const status = optionalEnum(body, "status", DOCUMENT_STATUSES, "draft", errors);
  const requested_by_user_id = optionalNullableFk(
    body,
    "requested_by_user_id",
    errors
  );
  const confirmed_by_user_id = optionalNullableFk(
    body,
    "confirmed_by_user_id",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    source_warehouse_id === null ||
    destination_warehouse_id === null ||
    transfer_date === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    reference_code: reference_code === undefined ? null : reference_code,
    source_warehouse_id,
    destination_warehouse_id,
    transfer_date,
    status,
    requested_by_user_id,
    confirmed_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
