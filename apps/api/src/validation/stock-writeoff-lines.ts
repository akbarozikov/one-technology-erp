import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

export interface StockWriteoffLineCreateInput {
  stock_writeoff_id: number;
  product_id: number;
  position_id: number;
  quantity: number;
  unit_id: number;
  line_notes: string | null;
}

export function parseStockWriteoffLineCreate(
  body: JsonObject,
  errors: Failures
): StockWriteoffLineCreateInput | null {
  const stock_writeoff_id = requirePositiveInt(body, "stock_writeoff_id", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const position_id = requirePositiveInt(body, "position_id", errors);
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const line_notes = optionalTrimmedString(body, "line_notes", errors);

  if (
    stock_writeoff_id === null ||
    product_id === null ||
    position_id === null ||
    quantity === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    stock_writeoff_id,
    product_id,
    position_id,
    quantity,
    unit_id,
    line_notes: line_notes === undefined ? null : line_notes,
  };
}
