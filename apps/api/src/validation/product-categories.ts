import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalNullableFk,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

export interface ProductCategoryCreateInput {
  parent_category_id: number | null;
  name: string;
  code: string;
  description: string | null;
  is_active: 0 | 1;
}

export function parseProductCategoryCreate(
  body: JsonObject,
  errors: Failures
): ProductCategoryCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const parent_category_id = optionalNullableFk(body, "parent_category_id", errors);
  const description = optionalTrimmedString(body, "description", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (name === null || code === null || errors.length > 0) return null;

  return {
    parent_category_id,
    name,
    code,
    description: description === undefined ? null : description,
    is_active,
  };
}
