import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

export interface StockMovementLineCreateInput {
  stock_movement_id: number;
  product_id: number;
  from_position_id: number | null;
  to_position_id: number | null;
  quantity: number;
  unit_id: number;
  unit_cost: number | null;
  line_notes: string | null;
}

export function parseStockMovementLineCreate(
  body: JsonObject,
  errors: Failures
): StockMovementLineCreateInput | null {
  const stock_movement_id = requirePositiveInt(body, "stock_movement_id", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const from_position_id = optionalNullableFk(body, "from_position_id", errors);
  const to_position_id = optionalNullableFk(body, "to_position_id", errors);
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const unit_cost = optionalNullableNumber(body, "unit_cost", errors);
  const line_notes = optionalTrimmedString(body, "line_notes", errors);

  if (
    stock_movement_id === null ||
    product_id === null ||
    quantity === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    stock_movement_id,
    product_id,
    from_position_id,
    to_position_id,
    quantity,
    unit_id,
    unit_cost: unit_cost === undefined ? null : unit_cost,
    line_notes: line_notes === undefined ? null : line_notes,
  };
}
