import type { LocationType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const LOCATION_TYPES: readonly LocationType[] = [
  "office",
  "warehouse",
  "showroom",
  "partner_stock_point",
];

export interface LocationCreateInput {
  branch_id: number;
  name: string;
  code: string;
  location_type: LocationType;
  address_text: string | null;
  city: string | null;
  country: string | null;
  is_active: 0 | 1;
  notes: string | null;
}

export function parseLocationCreate(
  body: JsonObject,
  errors: Failures
): LocationCreateInput | null {
  const branch_id_raw = body["branch_id"];
  let branch_id: number | null = null;
  if (
    typeof branch_id_raw === "number" &&
    Number.isInteger(branch_id_raw) &&
    branch_id_raw > 0
  ) {
    branch_id = branch_id_raw;
  } else {
    errors.push("branch_id is required and must be a positive integer");
  }

  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const location_type = requireEnum(body, "location_type", LOCATION_TYPES, errors);
  const address_text = optionalTrimmedString(body, "address_text", errors);
  const city = optionalTrimmedString(body, "city", errors);
  const country = optionalTrimmedString(body, "country", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (
    branch_id === null ||
    name === null ||
    code === null ||
    location_type === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    branch_id,
    name,
    code,
    location_type,
    address_text: address_text === undefined ? null : address_text,
    city: city === undefined ? null : city,
    country: country === undefined ? null : country,
    is_active,
    notes: notes === undefined ? null : notes,
  };
}
