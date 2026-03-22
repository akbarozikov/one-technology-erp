import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableNumber,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

export interface PurchaseReceiptLineCreateInput {
  purchase_receipt_id: number;
  line_number: number;
  product_id: number;
  destination_position_id: number;
  quantity: number;
  unit_id: number;
  unit_cost: number | null;
  line_total: number | null;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  notes: string | null;
}

export function parsePurchaseReceiptLineCreate(
  body: JsonObject,
  errors: Failures
): PurchaseReceiptLineCreateInput | null {
  const purchase_receipt_id = requirePositiveInt(body, "purchase_receipt_id", errors);
  const line_number = requirePositiveInt(body, "line_number", errors);
  const product_id = requirePositiveInt(body, "product_id", errors);
  const destination_position_id = requirePositiveInt(
    body,
    "destination_position_id",
    errors
  );
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const unit_cost = optionalNullableNumber(body, "unit_cost", errors);
  if (typeof unit_cost === "number" && unit_cost < 0) {
    errors.push("unit_cost must be a non-negative number or null");
  }
  const line_total = optionalNullableNumber(body, "line_total", errors);
  if (typeof line_total === "number" && line_total < 0) {
    errors.push("line_total must be a non-negative number or null");
  }
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
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    purchase_receipt_id === null ||
    line_number === null ||
    product_id === null ||
    destination_position_id === null ||
    quantity === null ||
    unit_id === null ||
    snapshot_product_name === null ||
    snapshot_sku === null ||
    snapshot_unit_name === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    purchase_receipt_id,
    line_number,
    product_id,
    destination_position_id,
    quantity,
    unit_id,
    unit_cost: unit_cost === undefined ? null : unit_cost,
    line_total: line_total === undefined ? null : line_total,
    snapshot_product_name,
    snapshot_sku,
    snapshot_unit_name,
    notes: notes === undefined ? null : notes,
  };
}
