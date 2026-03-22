import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

export interface SupplierCreateInput {
  name: string;
  code: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  notes: string | null;
  is_active: 0 | 1;
}

export function parseSupplierCreate(
  body: JsonObject,
  errors: Failures
): SupplierCreateInput | null {
  const name = requireNonEmptyString(body, "name", errors);
  const code = requireNonEmptyString(body, "code", errors);
  const contact_person = optionalTrimmedString(body, "contact_person", errors);
  const phone = optionalTrimmedString(body, "phone", errors);
  const email = optionalTrimmedString(body, "email", errors);
  const address_text = optionalTrimmedString(body, "address_text", errors);
  const city = optionalTrimmedString(body, "city", errors);
  const country = optionalTrimmedString(body, "country", errors);
  const tax_id = optionalTrimmedString(body, "tax_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (name === null || code === null || errors.length > 0) return null;

  return {
    name,
    code,
    contact_person: contact_person === undefined ? null : contact_person,
    phone: phone === undefined ? null : phone,
    email: email === undefined ? null : email,
    address_text: address_text === undefined ? null : address_text,
    city: city === undefined ? null : city,
    country: country === undefined ? null : country,
    tax_id: tax_id === undefined ? null : tax_id,
    notes: notes === undefined ? null : notes,
    is_active,
  };
}
