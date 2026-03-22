import type { JsonObject } from "../lib/json";

export type Failures = string[];

export function push(errors: Failures, message: string): void {
  errors.push(message);
}

export function requireNonEmptyString(
  body: JsonObject,
  key: string,
  errors: Failures
): string | null {
  const v = body[key];
  if (typeof v !== "string" || v.trim() === "") {
    push(errors, `${key} is required`);
    return null;
  }
  return v.trim();
}

export function optionalTrimmedString(
  body: JsonObject,
  key: string,
  errors: Failures
): string | null | undefined {
  if (!(key in body) || body[key] === undefined) return undefined;
  if (body[key] === null) return null;
  if (typeof body[key] !== "string") {
    push(errors, `${key} must be a string`);
    return null;
  }
  const s = body[key] as string;
  return s.trim() === "" ? null : s.trim();
}

/** Boolean in JSON for flags like is_active; default if key missing. */
export function optionalBoolAsInt(
  body: JsonObject,
  key: string,
  defaultValue: 0 | 1,
  errors: Failures
): 0 | 1 {
  if (!(key in body) || body[key] === undefined) return defaultValue;
  const v = body[key];
  if (typeof v === "boolean") return v ? 1 : 0;
  push(errors, `${key} must be a boolean`);
  return defaultValue;
}

export function optionalInt(
  body: JsonObject,
  key: string,
  defaultValue: number,
  errors: Failures
): number {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return defaultValue;
  }
  const v = body[key];
  if (typeof v === "number" && Number.isInteger(v)) return v;
  push(errors, `${key} must be an integer`);
  return defaultValue;
}

/** Positive integer FK or null (explicit null / omitted -> null). */
export function optionalNullableFk(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return null;
  }
  const v = body[key];
  if (typeof v === "number" && Number.isInteger(v) && v > 0) return v;
  push(errors, `${key} must be a positive integer or null`);
  return null;
}

export function requireEnum<T extends string>(
  body: JsonObject,
  key: string,
  allowed: readonly T[],
  errors: Failures
): T | null {
  const v = body[key];
  if (typeof v !== "string" || !allowed.includes(v as T)) {
    push(errors, `${key} must be one of: ${allowed.join(", ")}`);
    return null;
  }
  return v as T;
}

export function optionalEnum<T extends string>(
  body: JsonObject,
  key: string,
  allowed: readonly T[],
  defaultValue: T,
  errors: Failures
): T | null {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return defaultValue;
  }
  return requireEnum(body, key, allowed, errors);
}

export function requirePositiveInt(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null {
  const v = body[key];
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
    push(errors, `${key} is required and must be a positive integer`);
    return null;
  }
  return v;
}

export function requirePositiveNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null {
  const v = body[key];
  if (typeof v !== "number" || Number.isNaN(v) || v <= 0) {
    push(errors, `${key} is required and must be a positive number`);
    return null;
  }
  return v;
}

export function optionalNullableNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return undefined;
  }
  const v = body[key];
  if (typeof v !== "number" || Number.isNaN(v)) {
    push(errors, `${key} must be a number`);
    return null;
  }
  return v;
}

export function optionalNullableBoolInt(
  body: JsonObject,
  key: string,
  errors: Failures
): 0 | 1 | null | undefined {
  if (!(key in body) || body[key] === undefined) return undefined;
  if (body[key] === null) return null;
  const v = body[key];
  if (typeof v === "boolean") return v ? 1 : 0;
  push(errors, `${key} must be a boolean or null`);
  return null;
}
