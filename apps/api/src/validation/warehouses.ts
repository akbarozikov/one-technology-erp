import type { WarehouseType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const WAREHOUSE_TYPES: readonly WarehouseType[] = [
  "main",
  "secondary",
  "partner",
  "temporary",
];

export interface WarehouseCreateInput {
  location_id: number;
  name: string;
  code: string;
  warehouse_type: WarehouseType;
  is_external: 0 | 1;
  is_active: 0 | 1;
  notes: string | null;
}

export function parseWarehouseCreate(
  body: JsonObject,
  errors: Failures
): WarehouseCreateInput | null {
  const location_id_raw = body["location_id"];
  let location_id: number | null = null;
  if (
    typeof location_id_raw === "number" &&
    Number.isInteger(location_id_raw) &&
    location_id_raw > 0
  ) {
    location_id = location_id_raw;
  } else {
    errors.push("location_id is required and must be a positive integer");
  }

  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const warehouse_type = requireEnum(body, "warehouse_type", WAREHOUSE_TYPES, errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_external = optionalBoolAsInt(body, "is_external", 0, errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (
    location_id === null ||
    name === null ||
    code === null ||
    warehouse_type === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    location_id,
    name,
    code,
    warehouse_type,
    is_external,
    is_active,
    notes: notes === undefined ? null : notes,
  };
}
