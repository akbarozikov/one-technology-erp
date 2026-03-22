import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableBoolInt,
  optionalNullableNumber,
  optionalTrimmedString,
  requirePositiveInt,
} from "./helpers";

export interface ProductAttributeValueCreateInput {
  product_id: number;
  attribute_id: number;
  value_text: string | null;
  value_number: number | null;
  value_boolean: 0 | 1 | null;
  value_json: string | null;
}

export function parseProductAttributeValueCreate(
  body: JsonObject,
  errors: Failures
): ProductAttributeValueCreateInput | null {
  const product_id = requirePositiveInt(body, "product_id", errors);
  const attribute_id = requirePositiveInt(body, "attribute_id", errors);
  const value_text = optionalTrimmedString(body, "value_text", errors);
  const value_number = optionalNullableNumber(body, "value_number", errors);
  const value_boolean = optionalNullableBoolInt(body, "value_boolean", errors);
  const value_json = optionalTrimmedString(body, "value_json", errors);

  if (product_id === null || attribute_id === null || errors.length > 0) {
    return null;
  }

  return {
    product_id,
    attribute_id,
    value_text: value_text === undefined ? null : value_text,
    value_number:
      value_number === undefined ? null : value_number === null ? null : value_number,
    value_boolean:
      value_boolean === undefined ? null : value_boolean === null ? null : value_boolean,
    value_json: value_json === undefined ? null : value_json,
  };
}
