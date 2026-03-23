import type { InstallationAssignmentRole } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requireEnum,
  requirePositiveInt,
} from "./helpers";

const INSTALLATION_ASSIGNMENT_ROLES: readonly InstallationAssignmentRole[] = [
  "lead_installer",
  "installer",
  "technician",
  "assistant",
];

export interface InstallationAssignmentCreateInput {
  installation_job_id: number;
  employee_id: number;
  assignment_role: InstallationAssignmentRole;
  assigned_at: string | null;
  notes: string | null;
}

export function parseInstallationAssignmentCreate(
  body: JsonObject,
  errors: Failures
): InstallationAssignmentCreateInput | null {
  const installation_job_id = requirePositiveInt(
    body,
    "installation_job_id",
    errors
  );
  const employee_id = requirePositiveInt(body, "employee_id", errors);
  const assignment_role = requireEnum(
    body,
    "assignment_role",
    INSTALLATION_ASSIGNMENT_ROLES,
    errors
  );
  const assigned_at = optionalTrimmedString(body, "assigned_at", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    installation_job_id === null ||
    employee_id === null ||
    assignment_role === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    installation_job_id,
    employee_id,
    assignment_role,
    assigned_at: assigned_at === undefined ? null : assigned_at,
    notes: notes === undefined ? null : notes,
  };
}
