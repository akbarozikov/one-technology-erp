import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requireNonNegativeNumber,
  requireNumber,
  requirePositiveInt,
} from "./helpers";

export interface InventoryCountLineCreateInput {
  inventory_count_id: number;
  product_id: number;
  position_id: number;
  system_qty: number;
  counted_qty: number;
  difference_qty: number;
  unit_id: number;
  line_notes: string | null;
}

export function parseInventoryCountLineCreate(
  body: JsonObject,
  errors: Failures
): InventoryCountLineCreateInput | null {
  const inventory_count_id = requirePositiveInt(body, "inventory_count_id", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const position_id = requirePositiveInt(body, "position_id", errors);
  const system_qty = requireNonNegativeNumber(body, "system_qty", errors);
  const counted_qty = requireNonNegativeNumber(body, "counted_qty", errors);
  const difference_qty = requireNumber(body, "difference_qty", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const line_notes = optionalTrimmedString(body, "line_notes", errors);

  if (
    inventory_count_id === null ||
    product_id === null ||
    position_id === null ||
    system_qty === null ||
    counted_qty === null ||
    difference_qty === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    inventory_count_id,
    product_id,
    position_id,
    system_qty,
    counted_qty,
    difference_qty,
    unit_id,
    line_notes: line_notes === undefined ? null : line_notes,
  };
}
