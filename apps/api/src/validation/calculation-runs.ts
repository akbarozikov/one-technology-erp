import type { CalculationRunStatus, CalculationRunType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requirePositiveInt,
} from "./helpers";

const CALCULATION_RUN_TYPES: readonly CalculationRunType[] = [
  "full",
  "spring_only",
  "bom_only",
  "pricing_only",
  "validation_only",
];

const CALCULATION_RUN_STATUSES: readonly CalculationRunStatus[] = [
  "success",
  "warning",
  "failed",
];

export interface CalculationRunCreateInput {
  variant_id: number;
  run_type: CalculationRunType;
  run_status: CalculationRunStatus;
  input_snapshot_json: string | null;
  output_snapshot_json: string | null;
  warnings_json: string | null;
  errors_json: string | null;
  executed_by_user_id: number | null;
  executed_at: string | null;
}

export function parseCalculationRunCreate(
  body: JsonObject,
  errors: Failures
): CalculationRunCreateInput | null {
  const variant_id = requirePositiveInt(body, "variant_id", errors);
  const run_type = requireEnum(body, "run_type", CALCULATION_RUN_TYPES, errors);
  const run_status = optionalEnum(
    body,
    "run_status",
    CALCULATION_RUN_STATUSES,
    "success",
    errors
  );
  const input_snapshot_json = optionalTrimmedString(body, "input_snapshot_json", errors);
  const output_snapshot_json = optionalTrimmedString(body, "output_snapshot_json", errors);
  const warnings_json = optionalTrimmedString(body, "warnings_json", errors);
  const errors_json = optionalTrimmedString(body, "errors_json", errors);
  const executed_by_user_id = optionalNullableFk(body, "executed_by_user_id", errors);
  const executed_at = optionalTrimmedString(body, "executed_at", errors);

  if (
    variant_id === null ||
    run_type === null ||
    run_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    variant_id,
    run_type,
    run_status,
    input_snapshot_json:
      input_snapshot_json === undefined ? null : input_snapshot_json,
    output_snapshot_json:
      output_snapshot_json === undefined ? null : output_snapshot_json,
    warnings_json: warnings_json === undefined ? null : warnings_json,
    errors_json: errors_json === undefined ? null : errors_json,
    executed_by_user_id,
    executed_at: executed_at === undefined ? null : executed_at,
  };
}
