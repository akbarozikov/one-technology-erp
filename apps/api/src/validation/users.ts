import type { UserStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

const USER_STATUSES: readonly UserStatus[] = [
  "active",
  "inactive",
  "suspended",
];

export interface UserCreateInput {
  email: string | null;
  phone: string | null;
  password_hash: string;
  status: UserStatus;
}

export function parseUserCreate(
  body: JsonObject,
  errors: Failures
): UserCreateInput | null {
  const email = optionalTrimmedString(body, "email", errors);
  const phone = optionalTrimmedString(body, "phone", errors);
  const password_hash = requireNonEmptyString(body, "password_hash", errors);
  const status = optionalEnum(body, "status", USER_STATUSES, "active", errors);
  if (password_hash === null || status === null || errors.length > 0) return null;
  return {
    email: email === undefined ? null : email,
    phone: phone === undefined ? null : phone,
    password_hash,
    status,
  };
}
