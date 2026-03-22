import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

export interface StockTransferLineCreateInput {
  stock_transfer_document_id: number;
  product_id: number;
  from_position_id: number;
  to_position_id: number;
  quantity: number;
  unit_id: number;
  line_notes: string | null;
}

export function parseStockTransferLineCreate(
  body: JsonObject,
  errors: Failures
): StockTransferLineCreateInput | null {
  const stock_transfer_document_id = requirePositiveInt(
    body,
    "stock_transfer_document_id",
    errors
  );
  const product_id = requirePositiveInt(body, "product_id", errors);
  const from_position_id = requirePositiveInt(body, "from_position_id", errors);
  const to_position_id = requirePositiveInt(body, "to_position_id", errors);
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const line_notes = optionalTrimmedString(body, "line_notes", errors);

  if (
    stock_transfer_document_id === null ||
    product_id === null ||
    from_position_id === null ||
    to_position_id === null ||
    quantity === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    stock_transfer_document_id,
    product_id,
    from_position_id,
    to_position_id,
    quantity,
    unit_id,
    line_notes: line_notes === undefined ? null : line_notes,
  };
}
