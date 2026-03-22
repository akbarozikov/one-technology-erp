import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

export interface UnitOfMeasureCreateInput {
  name: string;
  code: string;
  symbol: string | null;
  description: string | null;
  is_active: 0 | 1;
}

export function parseUnitOfMeasureCreate(
  body: JsonObject,
  errors: Failures
): UnitOfMeasureCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const symbol = optionalTrimmedString(body, "symbol", errors);
  const description = optionalTrimmedString(body, "description", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (name === null || code === null || errors.length > 0) return null;

  return {
    name,
    code,
    symbol: symbol === undefined ? null : symbol,
    description: description === undefined ? null : description,
    is_active,
  };
}
