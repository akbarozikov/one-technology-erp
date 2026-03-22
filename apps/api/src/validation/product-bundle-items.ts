import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalInt,
  requirePositiveInt,
  requirePositiveNumber,
} from "./helpers";

export interface ProductBundleItemCreateInput {
  bundle_id: number;
  component_product_id: number;
  quantity: number;
  unit_id: number;
  sort_order: number;
  is_optional: 0 | 1;
}

export function parseProductBundleItemCreate(
  body: JsonObject,
  errors: Failures
): ProductBundleItemCreateInput | null {
  const bundle_id = requirePositiveInt(body, "bundle_id", errors);
  const component_product_id = requirePositiveInt(body, "component_product_id", errors);
  const quantity = requirePositiveNumber(body, "quantity", errors);
  const unit_id = requirePositiveInt(body, "unit_id", errors);
  const sort_order = optionalInt(body, "sort_order", 0, errors);
  const is_optional = optionalBoolAsInt(body, "is_optional", 0, errors);

  if (
    bundle_id === null ||
    component_product_id === null ||
    quantity === null ||
    unit_id === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    bundle_id,
    component_product_id,
    quantity,
    unit_id,
    sort_order,
    is_optional,
  };
}
