import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

export interface DepartmentCreateInput {
  name: string;
  code: string;
  description: string | null;
  is_active: 0 | 1;
}

export function parseDepartmentCreate(
  body: JsonObject,
  errors: Failures
): DepartmentCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const description = optionalTrimmedString(body, "description", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);
  if (name === null || code === null || errors.length > 0) return null;
  return {
    name,
    code,
    description: description === undefined ? null : description,
    is_active,
  };
}
