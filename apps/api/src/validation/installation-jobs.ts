import type {
  DocumentTemplateType,
  InstallationJobStatus,
  InstallationJobType,
} from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableFk,
  optionalTrimmedString,
  push,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const INSTALLATION_JOB_TYPES: readonly InstallationJobType[] = [
  "installation",
  "service",
  "inspection",
  "revisit",
];

const INSTALLATION_JOB_STATUSES: readonly InstallationJobStatus[] = [
  "draft",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "failed",
];

const INSTALLATION_DOCUMENT_TEMPLATE_TYPES: readonly DocumentTemplateType[] = [
  "installation",
  "service",
];

export interface InstallationJobCreateInput {
  order_id: number | null;
  order_line_id: number | null;
  job_number: string;
  job_type: InstallationJobType;
  job_status: InstallationJobStatus;
  planned_date: string | null;
  scheduled_time_from: string | null;
  scheduled_time_to: string | null;
  actual_started_at: string | null;
  actual_completed_at: string | null;
  address_text: string | null;
  city: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  completed_by_user_id: number | null;
}

export interface InstallationJobCompletionInput {
  installation_result_id: number | null;
  order_line_id: number | null;
  reservation_id: number | null;
  completed_by_user_id: number | null;
  actual_completed_at: string | null;
  notes: string | null;
}

export interface InstallationJobGenerateDocumentInput {
  template_id: number;
  installation_result_id: number | null;
  document_number: string | null;
  title: string | null;
  generated_by_user_id: number | null;
  create_job_link: 0 | 1;
}

export function parseInstallationJobCreate(
  body: JsonObject,
  errors: Failures
): InstallationJobCreateInput | null {
  const job_number = requireNonEmptyString(body, "job_number", errors);
  const job_type = requireEnum(body, "job_type", INSTALLATION_JOB_TYPES, errors);
  const job_status = optionalEnum(
    body,
    "job_status",
    INSTALLATION_JOB_STATUSES,
    "draft",
    errors
  );
  const order_id = optionalNullableFk(body, "order_id", errors);
  const order_line_id = optionalNullableFk(body, "order_line_id", errors);
  const planned_date = optionalTrimmedString(body, "planned_date", errors);
  const scheduled_time_from = optionalTrimmedString(
    body,
    "scheduled_time_from",
    errors
  );
  const scheduled_time_to = optionalTrimmedString(
    body,
    "scheduled_time_to",
    errors
  );
  const actual_started_at = optionalTrimmedString(
    body,
    "actual_started_at",
    errors
  );
  const actual_completed_at = optionalTrimmedString(
    body,
    "actual_completed_at",
    errors
  );
  const address_text = optionalTrimmedString(body, "address_text", errors);
  const city = optionalTrimmedString(body, "city", errors);
  const contact_name = optionalTrimmedString(body, "contact_name", errors);
  const contact_phone = optionalTrimmedString(body, "contact_phone", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const created_by_user_id = optionalNullableFk(body, "created_by_user_id", errors);
  const approved_by_user_id = optionalNullableFk(body, "approved_by_user_id", errors);
  const completed_by_user_id = optionalNullableFk(body, "completed_by_user_id", errors);

  if (
    job_number === null ||
    job_type === null ||
    job_status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    order_id,
    order_line_id,
    job_number,
    job_type,
    job_status,
    planned_date: planned_date === undefined ? null : planned_date,
    scheduled_time_from:
      scheduled_time_from === undefined ? null : scheduled_time_from,
    scheduled_time_to: scheduled_time_to === undefined ? null : scheduled_time_to,
    actual_started_at: actual_started_at === undefined ? null : actual_started_at,
    actual_completed_at:
      actual_completed_at === undefined ? null : actual_completed_at,
    address_text: address_text === undefined ? null : address_text,
    city: city === undefined ? null : city,
    contact_name: contact_name === undefined ? null : contact_name,
    contact_phone: contact_phone === undefined ? null : contact_phone,
    notes: notes === undefined ? null : notes,
    created_by_user_id,
    approved_by_user_id,
    completed_by_user_id,
  };
}

export function parseInstallationJobCompletion(
  body: JsonObject,
  errors: Failures
): InstallationJobCompletionInput | null {
  const installation_result_id = optionalNullableFk(
    body,
    "installation_result_id",
    errors
  );
  const order_line_id = optionalNullableFk(body, "order_line_id", errors);
  const reservation_id = optionalNullableFk(body, "reservation_id", errors);
  const completed_by_user_id = optionalNullableFk(
    body,
    "completed_by_user_id",
    errors
  );
  const actual_completed_at = optionalTrimmedString(
    body,
    "actual_completed_at",
    errors
  );
  const notes = optionalTrimmedString(body, "notes", errors);

  if (errors.length > 0) {
    return null;
  }

  return {
    installation_result_id,
    order_line_id,
    reservation_id,
    completed_by_user_id,
    actual_completed_at: actual_completed_at === undefined ? null : actual_completed_at,
    notes: notes === undefined ? null : notes,
  };
}

export function parseInstallationJobGenerateDocument(
  body: JsonObject,
  errors: Failures
): InstallationJobGenerateDocumentInput | null {
  const template_id = optionalNullableFk(body, "template_id", errors);
  if (template_id === null) {
    push(errors, "template_id is required and must be a positive integer");
  }

  const installation_result_id = optionalNullableFk(
    body,
    "installation_result_id",
    errors
  );
  const document_number = optionalTrimmedString(body, "document_number", errors);
  if ("document_number" in body && document_number === null) {
    push(errors, "document_number must be a non-empty string when provided");
  }

  const title = optionalTrimmedString(body, "title", errors);
  if ("title" in body && title === null) {
    push(errors, "title must be a non-empty string when provided");
  }

  const generated_by_user_id = optionalNullableFk(
    body,
    "generated_by_user_id",
    errors
  );
  const create_job_link = optionalBoolAsInt(body, "create_job_link", 0, errors);

  if (template_id === null || errors.length > 0) {
    return null;
  }

  return {
    template_id,
    installation_result_id,
    document_number: document_number === undefined ? null : document_number,
    title: title === undefined ? null : title,
    generated_by_user_id,
    create_job_link,
  };
}

void INSTALLATION_DOCUMENT_TEMPLATE_TYPES;
