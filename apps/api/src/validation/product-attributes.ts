import type { ProductAttributeDataType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const DATA_TYPES: readonly ProductAttributeDataType[] = [
  "text",
  "number",
  "boolean",
  "select",
  "json",
];

export interface ProductAttributeCreateInput {
  name: string;
  code: string;
  data_type: ProductAttributeDataType;
  unit_hint: string | null;
  is_filterable: 0 | 1;
  is_required: 0 | 1;
  is_active: 0 | 1;
}

export function parseProductAttributeCreate(
  body: JsonObject,
  errors: Failures
): ProductAttributeCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const data_type = requireEnum(body, "data_type", DATA_TYPES, errors);
  const unit_hint = optionalTrimmedString(body, "unit_hint", errors);
  const is_filterable = optionalBoolAsInt(body, "is_filterable", 0, errors);
  const is_required = optionalBoolAsInt(body, "is_required", 0, errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (name === null || code === null || data_type === null || errors.length > 0) {
    return null;
  }

  return {
    name,
    code,
    data_type,
    unit_hint: unit_hint === undefined ? null : unit_hint,
    is_filterable,
    is_required,
    is_active,
  };
}
