import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import { optionalTrimmedString, requireNonEmptyString } from "./helpers";

export interface PermissionCreateInput {
  name: string;
  code: string;
  module: string;
  description: string | null;
}

export function parsePermissionCreate(
  body: JsonObject,
  errors: Failures
): PermissionCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const moduleName = requireNonEmptyString(body, "module", errors);
  const description = optionalTrimmedString(body, "description", errors);
  if (name === null || code === null || moduleName === null || errors.length > 0) {
    return null;
  }
  return {
    name,
    code,
    module: moduleName,
    description: description === undefined ? null : description,
  };
}
