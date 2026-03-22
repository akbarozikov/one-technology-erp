import type { BomLineStatus, BomSourceType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

const BOM_SOURCE_TYPES: readonly BomSourceType[] = [
  "rule_engine",
  "spring_calculation",
  "manual",
  "bundle_logic",
  "copied",
];

const BOM_LINE_STATUSES: readonly BomLineStatus[] = [
  "active",
  "removed",
  "superseded",
];

function optionalNullableNonNegativeNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  const value = optionalNullableNumber(body, key, errors);
  if (value === undefined || value === null) return value;
  if (value < 0) {
    push(errors, `${key} must be a non-negative number`);
    return null;
  }
  return value;
}

export interface BomLineCreateInput {
  variant_id: number;
  product_id: number;
  source_type: BomSourceType;
  source_reference: string | null;
  line_number: number;
  quantity: number;
  unit_id: number;
  waste_factor: number | null;
  unit_cost_snapshot: number | null;
  unit_price_snapshot: number | null;
  line_cost_total: number | null;
  line_price_total: number | null;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  is_auto_generated: 0 | 1;
  is_manually_edited: 0 | 1;
  is_optional: 0 | 1;
  line_status: BomLineStatus;
  notes: string | null;
}

export function parseBomLineCreate(
  body: JsonObject,
  errors: Failures
): BomLineCreateInput | null {
  const variant_id = requirePositiveInt(body, "variant_id", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const source_type = requireEnum(body, "source_type", BOM_SOURCE_TYPES, errors);
  const source_reference = optionalTrimmedString(body, "source_reference", errors);
  const line_number = requirePositiveInt(body, "line_number", errors);
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const waste_factor = optionalNullableNonNegativeNumber(body, "waste_factor", errors);
  const unit_cost_snapshot = optionalNullableNonNegativeNumber(
    body,
    "unit_cost_snapshot",
    errors
  );
  const unit_price_snapshot = optionalNullableNonNegativeNumber(
    body,
    "unit_price_snapshot",
    errors
  );
  const line_cost_total = optionalNullableNonNegativeNumber(
    body,
    "line_cost_total",
    errors
  );
  const line_price_total = optionalNullableNonNegativeNumber(
    body,
    "line_price_total",
    errors
  );
  const snapshot_product_name = requireNonEmptyString(
    body,
    "snapshot_product_name",
    errors
  );
  const snapshot_sku = requireNonEmptyString(body, "snapshot_sku", errors);
  const snapshot_unit_name = requireNonEmptyString(
    body,
    "snapshot_unit_name",
    errors
  );
  const is_auto_generated = optionalBoolAsInt(body, "is_auto_generated", 0, errors);
  const is_manually_edited = optionalBoolAsInt(body, "is_manually_edited", 0, errors);
  const is_optional = optionalBoolAsInt(body, "is_optional", 0, errors);
  const line_status = optionalEnum(
    body,
    "line_status",
    BOM_LINE_STATUSES,
    "active",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    variant_id === null ||
    product_id === null ||
    source_type === null ||
    line_number === null ||
    quantity === null ||
    unit_id === null ||
    snapshot_product_name === null ||
    snapshot_sku === null ||
    snapshot_unit_name === null ||
    line_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    variant_id,
    product_id,
    source_type,
    source_reference: source_reference === undefined ? null : source_reference,
    line_number,
    quantity,
    unit_id,
    waste_factor: waste_factor === undefined ? null : waste_factor,
    unit_cost_snapshot:
      unit_cost_snapshot === undefined ? null : unit_cost_snapshot,
    unit_price_snapshot:
      unit_price_snapshot === undefined ? null : unit_price_snapshot,
    line_cost_total: line_cost_total === undefined ? null : line_cost_total,
    line_price_total: line_price_total === undefined ? null : line_price_total,
    snapshot_product_name,
    snapshot_sku,
    snapshot_unit_name,
    is_auto_generated,
    is_manually_edited,
    is_optional,
    line_status,
    notes: notes === undefined ? null : notes,
  };
}
