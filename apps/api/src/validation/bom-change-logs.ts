import type { BomChangeType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requirePositiveInt,
} from "./helpers";

const BOM_CHANGE_TYPES: readonly BomChangeType[] = [
  "create",
  "update",
  "delete",
  "manual_override",
  "auto_regeneration",
];

export interface BomChangeLogCreateInput {
  variant_id: number;
  bom_line_id: number | null;
  change_type: BomChangeType;
  old_values_json: string | null;
  new_values_json: string | null;
  reason: string | null;
  changed_by_user_id: number | null;
}

export function parseBomChangeLogCreate(
  body: JsonObject,
  errors: Failures
): BomChangeLogCreateInput | null {
  const variant_id = requirePositiveInt(body, "variant_id", errors);
  const bom_line_id = optionalNullableFk(body, "bom_line_id", errors);
  const change_type = requireEnum(body, "change_type", BOM_CHANGE_TYPES, errors);
  const old_values_json = optionalTrimmedString(body, "old_values_json", errors);
  const new_values_json = optionalTrimmedString(body, "new_values_json", errors);
  const reason = optionalTrimmedString(body, "reason", errors);
  const changed_by_user_id = optionalNullableFk(body, "changed_by_user_id", errors);

  if (variant_id === null || change_type === null || errors.length > 0) {
    return null;
  }

  return {
    variant_id,
    bom_line_id,
    change_type,
    old_values_json: old_values_json === undefined ? null : old_values_json,
    new_values_json: new_values_json === undefined ? null : new_values_json,
    reason: reason === undefined ? null : reason,
    changed_by_user_id,
  };
}
