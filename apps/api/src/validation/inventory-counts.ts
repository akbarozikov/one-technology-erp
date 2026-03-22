import type { InventoryCountStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const INVENTORY_COUNT_STATUSES: readonly InventoryCountStatus[] = [
  "draft",
  "in_progress",
  "completed",
  "cancelled",
];

export interface InventoryCountCreateInput {
  reference_code: string | null;
  warehouse_id: number;
  count_date: string;
  status: InventoryCountStatus;
  performed_by_user_id: number | null;
  notes: string | null;
}

export function parseInventoryCountCreate(
  body: JsonObject,
  errors: Failures
): InventoryCountCreateInput | null {
  const reference_code = optionalTrimmedString(body, "reference_code", errors);
  const warehouse_id = requirePositiveInt(body, "warehouse_id", errors);
  const count_date = requireNonEmptyString(body, "count_date", errors);
  const status = optionalEnum(
    body,
    "status",
    INVENTORY_COUNT_STATUSES,
    "draft",
    errors
  );
  const performed_by_user_id = optionalNullableFk(
    body,
    "performed_by_user_id",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    warehouse_id === null ||
    count_date === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    reference_code: reference_code === undefined ? null : reference_code,
    warehouse_id,
    count_date,
    status,
    performed_by_user_id,
    notes: notes === undefined ? null : notes,
  };
}
