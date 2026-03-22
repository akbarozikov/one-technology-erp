import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

export interface ProductBundleCreateInput {
  bundle_product_id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: 0 | 1;
}

export function parseProductBundleCreate(
  body: JsonObject,
  errors: Failures
): ProductBundleCreateInput | null {
  const bundle_product_id = requirePositiveInt(body, "bundle_product_id", errors);
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const description = optionalTrimmedString(body, "description", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (
    bundle_product_id === null ||
    name === null ||
    code === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    bundle_product_id,
    name,
    code,
    description: description === undefined ? null : description,
    is_active,
  };
}
