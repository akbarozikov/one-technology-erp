import type { InstallationResultStatus } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requirePositiveInt,
} from "./helpers";

const INSTALLATION_RESULT_STATUSES: readonly InstallationResultStatus[] = [
  "completed",
  "partial",
  "failed",
  "revisit_required",
];

export interface InstallationResultCreateInput {
  installation_job_id: number;
  result_status: InstallationResultStatus;
  completion_date: string | null;
  work_summary: string | null;
  issues_found: string | null;
  materials_used_notes: string | null;
  customer_feedback: string | null;
  customer_signoff_text: string | null;
  followup_required: 0 | 1;
  followup_notes: string | null;
  created_by_user_id: number | null;
}

export function parseInstallationResultCreate(
  body: JsonObject,
  errors: Failures
): InstallationResultCreateInput | null {
  const installation_job_id = requirePositiveInt(
    body,
    "installation_job_id",
    errors
  );
  const result_status = requireEnum(
    body,
    "result_status",
    INSTALLATION_RESULT_STATUSES,
    errors
  );
  const completion_date = optionalTrimmedString(body, "completion_date", errors);
  const work_summary = optionalTrimmedString(body, "work_summary", errors);
  const issues_found = optionalTrimmedString(body, "issues_found", errors);
  const materials_used_notes = optionalTrimmedString(
    body,
    "materials_used_notes",
    errors
  );
  const customer_feedback = optionalTrimmedString(
    body,
    "customer_feedback",
    errors
  );
  const customer_signoff_text = optionalTrimmedString(
    body,
    "customer_signoff_text",
    errors
  );
  const followup_required = optionalBoolAsInt(
    body,
    "followup_required",
    0,
    errors
  );
  const followup_notes = optionalTrimmedString(body, "followup_notes", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);

  if (
    installation_job_id === null ||
    result_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    installation_job_id,
    result_status,
    completion_date: completion_date === undefined ? null : completion_date,
    work_summary: work_summary === undefined ? null : work_summary,
    issues_found: issues_found === undefined ? null : issues_found,
    materials_used_notes:
      materials_used_notes === undefined ? null : materials_used_notes,
    customer_feedback:
      customer_feedback === undefined ? null : customer_feedback,
    customer_signoff_text:
      customer_signoff_text === undefined ? null : customer_signoff_text,
    followup_required,
    followup_notes: followup_notes === undefined ? null : followup_notes,
    created_by_user_id,
  };
}
