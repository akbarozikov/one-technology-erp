import type { InputType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalInt,
  optionalNullableBoolInt,
  optionalNullableNumber,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const INPUT_TYPES: readonly InputType[] = [
  "text",
  "number",
  "boolean",
  "select",
  "json",
];

export interface DoorConfigurationInputCreateInput {
  variant_id: number;
  input_key: string;
  input_label: string;
  input_type: InputType;
  value_text: string | null;
  value_number: number | null;
  value_boolean: 0 | 1 | null;
  value_json: string | null;
  unit_hint: string | null;
  sort_order: number;
}

export function parseDoorConfigurationInputCreate(
  body: JsonObject,
  errors: Failures
): DoorConfigurationInputCreateInput | null {
  const variant_id = requirePositiveInt(body, "variant_id", errors);
  const input_key = requireNonEmptyString(body, "input_key", errors);
  const input_label = requireNonEmptyString(body, "input_label", errors);
  const input_type = requireEnum(body, "input_type", INPUT_TYPES, errors);
  const value_text = optionalTrimmedString(body, "value_text", errors);
  const value_number = optionalNullableNumber(body, "value_number", errors);
  const value_boolean = optionalNullableBoolInt(body, "value_boolean", errors);
  const value_json = optionalTrimmedString(body, "value_json", errors);
  const unit_hint = optionalTrimmedString(body, "unit_hint", errors);
  const sort_order = optionalInt(body, "sort_order", 0, errors);

  if (
    variant_id === null ||
    input_key === null ||
    input_label === null ||
    input_type === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    variant_id,
    input_key,
    input_label,
    input_type,
    value_text: value_text === undefined ? null : value_text,
    value_number: value_number === undefined ? null : value_number,
    value_boolean: value_boolean === undefined ? null : value_boolean,
    value_json: value_json === undefined ? null : value_json,
    unit_hint: unit_hint === undefined ? null : unit_hint,
    sort_order,
  };
}
