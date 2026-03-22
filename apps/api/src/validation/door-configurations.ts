import type { ConfigurationStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  requireNonEmptyString,
} from "./helpers";

const CONFIGURATION_STATUSES: readonly ConfigurationStatus[] = [
  "draft",
  "in_progress",
  "ready",
  "quoted",
  "ordered",
  "cancelled",
  "archived",
];

export interface DoorConfigurationCreateInput {
  configuration_code: string;
  title: string;
  customer_id: number | null;
  deal_id: number | null;
  created_by_user_id: number | null;
  status: ConfigurationStatus;
  is_attached_to_quote: 0 | 1;
  is_attached_to_order: 0 | 1;
  selected_variant_id: number | null;
  notes: string | null;
}

export function parseDoorConfigurationCreate(
  body: JsonObject,
  errors: Failures
): DoorConfigurationCreateInput | null {
  const configuration_code = requireNonEmptyString(body, "configuration_code", errors);
  const title = requireNonEmptyString(body, "title", errors);
  const customer_id = optionalNullableFk(body, "customer_id", errors);
  const deal_id = optionalNullableFk(body, "deal_id", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const status = optionalEnum(
    body,
    "status",
    CONFIGURATION_STATUSES,
    "draft",
    errors
  );
  const is_attached_to_quote = optionalBoolAsInt(
    body,
    "is_attached_to_quote",
    0,
    errors
  );
  const is_attached_to_order = optionalBoolAsInt(
    body,
    "is_attached_to_order",
    0,
    errors
  );
  const selected_variant_id = optionalNullableFk(body, "selected_variant_id", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    configuration_code === null ||
    title === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    configuration_code,
    title,
    customer_id,
    deal_id,
    created_by_user_id,
    status,
    is_attached_to_quote,
    is_attached_to_order,
    selected_variant_id,
    notes: notes === undefined ? null : notes,
  };
}
