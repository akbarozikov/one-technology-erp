import type {
  StockMovementStatus,
  StockMovementType,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const STOCK_MOVEMENT_TYPES: readonly StockMovementType[] = [
  "purchase_receipt",
  "issue",
  "transfer",
  "adjustment",
  "writeoff",
  "return",
  "reservation_release",
  "manual",
];

const STOCK_MOVEMENT_STATUSES: readonly StockMovementStatus[] = [
  "draft",
  "confirmed",
  "cancelled",
];

export interface StockMovementCreateInput {
  movement_type: StockMovementType;
  reference_code: string | null;
  warehouse_id: number | null;
  source_warehouse_id: number | null;
  destination_warehouse_id: number | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: StockMovementStatus;
  movement_date: string;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
}

export function parseStockMovementCreate(
  body: JsonObject,
  errors: Failures
): StockMovementCreateInput | null {
  const movement_type = requireEnum(
    body,
    "movement_type",
    STOCK_MOVEMENT_TYPES,
    errors
  );
  const reference_code = optionalTrimmedString(body, "reference_code", errors);
  const warehouse_id = optionalNullableFk(body, "warehouse_id", errors);
  const source_warehouse_id = optionalNullableFk(body, "source_warehouse_id", errors);
  const destination_warehouse_id = optionalNullableFk(
    body,
    "destination_warehouse_id",
    errors
  );
  const related_entity_type = optionalTrimmedString(
    body,
    "related_entity_type",
    errors
  );
  const related_entity_id = optionalTrimmedString(body, "related_entity_id", errors);
  const status = optionalEnum(
    body,
    "status",
    STOCK_MOVEMENT_STATUSES,
    "draft",
    errors
  );
  const movement_date = requireNonEmptyString(body, "movement_date", errors);
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
    movement_type === null ||
    status === null ||
    movement_date === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    movement_type,
    reference_code: reference_code === undefined ? null : reference_code,
    warehouse_id,
    source_warehouse_id,
    destination_warehouse_id,
    related_entity_type:
      related_entity_type === undefined ? null : related_entity_type,
    related_entity_id: related_entity_id === undefined ? null : related_entity_id,
    status,
    movement_date,
    performed_by_user_id,
    approved_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
