import type { WarehousePositionType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalInt,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const POSITION_TYPES: readonly WarehousePositionType[] = [
  "zone",
  "rack",
  "shelf",
  "floor_area",
  "virtual",
];

export interface WarehousePositionCreateInput {
  warehouse_id: number;
  name: string;
  code: string;
  position_type: WarehousePositionType;
  parent_position_id: number | null;
  sort_order: number;
  is_active: 0 | 1;
  notes: string | null;
}

export function parseWarehousePositionCreate(
  body: JsonObject,
  errors: Failures
): WarehousePositionCreateInput | null {
  const warehouse_id_raw = body["warehouse_id"];
  let warehouse_id: number | null = null;
  if (
    typeof warehouse_id_raw === "number" &&
    Number.isInteger(warehouse_id_raw) &&
    warehouse_id_raw > 0
  ) {
    warehouse_id = warehouse_id_raw;
  } else {
    errors.push("warehouse_id is required and must be a positive integer");
  }

  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const position_type = requireEnum(body, "position_type", POSITION_TYPES, errors);
  const parent_position_id = optionalNullableFk(body, "parent_position_id", errors);
  const sort_order = optionalInt(body, "sort_order", 0, errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (
    warehouse_id === null ||
    name === null ||
    code === null ||
    position_type === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    warehouse_id,
    name,
    code,
    position_type,
    parent_position_id,
    sort_order,
    is_active,
    notes: notes === undefined ? null : notes,
  };
}
