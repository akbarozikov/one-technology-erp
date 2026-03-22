import type { BranchType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const BRANCH_TYPES: readonly BranchType[] = [
  "office",
  "showroom",
  "warehouse_branch",
  "partner_point",
  "mixed",
];

export interface BranchCreateInput {
  name: string;
  code: string;
  branch_type: BranchType;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  city: string | null;
  country: string | null;
  is_active: 0 | 1;
  notes: string | null;
}

export function parseBranchCreate(
  body: JsonObject,
  errors: Failures
): BranchCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const branch_type = requireEnum(body, "branch_type", BRANCH_TYPES, errors);
  const phone = optionalTrimmedString(body, "phone", errors);
  const email = optionalTrimmedString(body, "email", errors);
  const address_text = optionalTrimmedString(body, "address_text", errors);
  const city = optionalTrimmedString(body, "city", errors);
  const country = optionalTrimmedString(body, "country", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (name === null || code === null || branch_type === null || errors.length > 0) {
    return null;
  }

  return {
    name,
    code,
    branch_type,
    phone: phone === undefined ? null : phone,
    email: email === undefined ? null : email,
    address_text: address_text === undefined ? null : address_text,
    city: city === undefined ? null : city,
    country: country === undefined ? null : country,
    is_active,
    notes: notes === undefined ? null : notes,
  };
}
