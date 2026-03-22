import type {
  SpringResultStatus,
  SpringSystemType,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalNullableNumber,
  optionalTrimmedString,
  push,
  requireEnum,
  requirePositiveInt,
} from "./helpers";

const SPRING_SYSTEM_TYPES: readonly SpringSystemType[] = [
  "torsion",
  "extension",
  "other",
];

const SPRING_RESULT_STATUSES: readonly SpringResultStatus[] = [
  "valid",
  "warning",
  "invalid",
];

function optionalNullableNonNegativeInteger(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  if (!(key in body) || body[key] === undefined || body[key] === null) {
    return undefined;
  }
  const value = body[key];
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
    push(errors, `${key} must be a non-negative integer`);
    return null;
  }
  return value;
}

function optionalNullableNonNegativeNumber(
  body: JsonObject,
  key: string,
  errors: Failures
): number | null | undefined {
  const value = optionalNullableNumber(body, key, errors);
  if (value === undefined || value === null) return value;
  if (value < 0) {
    push(errors, `${key} must be a non-negative number`);
    return null;
  }
  return value;
}

export interface SpringCalculationResultCreateInput {
  calculation_run_id: number;
  spring_system_type: SpringSystemType;
  spring_count: number | null;
  wire_size: number | null;
  inner_diameter: number | null;
  spring_length: number | null;
  torque_value: number | null;
  cycle_rating: number | null;
  safety_factor: number | null;
  result_status: SpringResultStatus;
  warning_text: string | null;
  notes: string | null;
}

export function parseSpringCalculationResultCreate(
  body: JsonObject,
  errors: Failures
): SpringCalculationResultCreateInput | null {
  const calculation_run_id = requirePositiveInt(body, "calculation_run_id", errors);
  const spring_system_type = requireEnum(
    body,
    "spring_system_type",
    SPRING_SYSTEM_TYPES,
    errors
  );
  const spring_count = optionalNullableNonNegativeInteger(body, "spring_count", errors);
  const wire_size = optionalNullableNonNegativeNumber(body, "wire_size", errors);
  const inner_diameter = optionalNullableNonNegativeNumber(body, "inner_diameter", errors);
  const spring_length = optionalNullableNonNegativeNumber(body, "spring_length", errors);
  const torque_value = optionalNullableNumber(body, "torque_value", errors);
  const cycle_rating = optionalNullableNonNegativeInteger(body, "cycle_rating", errors);
  const safety_factor = optionalNullableNonNegativeNumber(body, "safety_factor", errors);
  const result_status = requireEnum(
    body,
    "result_status",
    SPRING_RESULT_STATUSES,
    errors
  );
  const warning_text = optionalTrimmedString(body, "warning_text", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    calculation_run_id === null ||
    spring_system_type === null ||
    result_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    calculation_run_id,
    spring_system_type,
    spring_count: spring_count === undefined ? null : spring_count,
    wire_size: wire_size === undefined ? null : wire_size,
    inner_diameter: inner_diameter === undefined ? null : inner_diameter,
    spring_length: spring_length === undefined ? null : spring_length,
    torque_value: torque_value === undefined ? null : torque_value,
    cycle_rating: cycle_rating === undefined ? null : cycle_rating,
    safety_factor: safety_factor === undefined ? null : safety_factor,
    result_status,
    warning_text: warning_text === undefined ? null : warning_text,
    notes: notes === undefined ? null : notes,
  };
}
