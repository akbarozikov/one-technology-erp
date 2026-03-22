import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requireNonNegativeNumber,
  requireNumber,
  requirePositiveInt,
} from "./helpers";

export interface StockAdjustmentLineCreateInput {
  stock_adjustment_id: number;
  product_id: number;
  position_id: number;
  old_qty: number;
  new_qty: number;
  difference_qty: number;
  unit_id: number;
  line_notes: string | null;
}

export function parseStockAdjustmentLineCreate(
  body: JsonObject,
  errors: Failures
): StockAdjustmentLineCreateInput | null {
  const stock_adjustment_id = requirePositiveInt(body, "stock_adjustment_id", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const position_id = requirePositiveInt(body, "position_id", errors);
  const old_qty = requireNonNegativeNumber(body, "old_qty", errors);
  const new_qty = requireNonNegativeNumber(body, "new_qty", errors);
  const difference_qty = requireNumber(body, "difference_qty", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const line_notes = optionalTrimmedString(body, "line_notes", errors);

  if (
    stock_adjustment_id === null ||
    product_id === null ||
    position_id === null ||
    old_qty === null ||
    new_qty === null ||
    difference_qty === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    stock_adjustment_id,
    product_id,
    position_id,
    old_qty,
    new_qty,
    difference_qty,
    unit_id,
    line_notes: line_notes === undefined ? null : line_notes,
  };
}
