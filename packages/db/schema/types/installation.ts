/**
 * Installation module: jobs, staff assignments, and historical completion results.
 */

export const TABLE_INSTALLATION_JOBS = "installation_jobs" as const;
export const TABLE_INSTALLATION_ASSIGNMENTS = "installation_assignments" as const;
export const TABLE_INSTALLATION_RESULTS = "installation_results" as const;

export type InstallationJobType =
  | "installation"
  | "service"
  | "inspection"
  | "revisit";

export type InstallationJobStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed";

export type InstallationAssignmentRole =
  | "lead_installer"
  | "installer"
  | "technician"
  | "assistant";

export type InstallationResultStatus =
  | "completed"
  | "partial"
  | "failed"
  | "revisit_required";

export interface InstallationJobRow {
  id: number;
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
  created_at: string;
  updated_at: string;
}

export interface InstallationAssignmentRow {
  id: number;
  installation_job_id: number;
  employee_id: number;
  assignment_role: InstallationAssignmentRole;
  assigned_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstallationResultRow {
  id: number;
  installation_job_id: number;
  result_status: InstallationResultStatus;
  completion_date: string | null;
  work_summary: string | null;
  issues_found: string | null;
  materials_used_notes: string | null;
  customer_feedback: string | null;
  customer_signoff_text: string | null;
  followup_required: number;
  followup_notes: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}
