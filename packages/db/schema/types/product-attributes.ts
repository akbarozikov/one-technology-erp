/**
 * Flexible EAV-style attribute definitions and per-product values.
 */

export const TABLE_PRODUCT_ATTRIBUTES = "product_attributes" as const;
export const TABLE_PRODUCT_ATTRIBUTE_VALUES = "product_attribute_values" as const;

export type ProductAttributeDataType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "json";

export interface ProductAttributeRow {
  id: number;
  name: string;
  code: string;
  data_type: ProductAttributeDataType;
  unit_hint: string | null;
  is_filterable: number;
  is_required: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ProductAttributeValueRow {
  id: number;
  product_id: number;
  attribute_id: number;
  value_text: string | null;
  value_number: number | null;
  value_boolean: number | null;
  value_json: string | null;
  created_at: string;
  updated_at: string;
}
