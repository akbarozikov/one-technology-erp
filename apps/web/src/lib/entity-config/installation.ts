import type { AdminNavGroup, EntityConfigMap } from "./shared";
import {
  employeeLookup,
  installationAssignmentRoles,
  installationJobLookup,
  installationJobStatuses,
  installationJobTypes,
  installationResultStatuses,
  orderLookup,
  userLookup,
} from "./shared";

export const installationConfigs = {
  installation_jobs: {
    title: "Installation jobs",
    apiPath: "/api/installation-jobs",
    fields: [
      { key: "order_id", label: "Order", kind: "select", lookup: orderLookup },
      { key: "order_line_id", label: "Order line ID", kind: "number" },
      { key: "job_number", label: "Job number", kind: "text", required: true },
      { key: "job_type", label: "Job type", kind: "select", required: true, options: installationJobTypes },
      { key: "job_status", label: "Job status", kind: "select", options: installationJobStatuses },
      { key: "planned_date", label: "Planned date", kind: "date" },
      { key: "scheduled_time_from", label: "Scheduled time from", kind: "text" },
      { key: "scheduled_time_to", label: "Scheduled time to", kind: "text" },
      { key: "actual_started_at", label: "Actual started at", kind: "datetime-local" },
      { key: "actual_completed_at", label: "Actual completed at", kind: "datetime-local" },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "contact_name", label: "Contact name", kind: "text" },
      { key: "contact_phone", label: "Contact phone", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user", kind: "select", lookup: userLookup },
      { key: "approved_by_user_id", label: "Approved by user", kind: "select", lookup: userLookup },
      { key: "completed_by_user_id", label: "Completed by user", kind: "select", lookup: userLookup },
    ],
  },
  installation_assignments: {
    title: "Installation assignments",
    apiPath: "/api/installation-assignments",
    fields: [
      { key: "installation_job_id", label: "Installation job", kind: "select", required: true, lookup: installationJobLookup },
      { key: "employee_id", label: "Employee", kind: "select", required: true, lookup: employeeLookup },
      { key: "assignment_role", label: "Assignment role", kind: "select", required: true, options: installationAssignmentRoles },
      { key: "assigned_at", label: "Assigned at", kind: "datetime-local" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  installation_results: {
    title: "Installation results",
    apiPath: "/api/installation-results",
    fields: [
      { key: "installation_job_id", label: "Installation job", kind: "select", required: true, lookup: installationJobLookup },
      { key: "result_status", label: "Result status", kind: "select", required: true, options: installationResultStatuses },
      { key: "completion_date", label: "Completion date", kind: "date" },
      { key: "work_summary", label: "Work summary", kind: "textarea" },
      { key: "issues_found", label: "Issues found", kind: "textarea" },
      { key: "materials_used_notes", label: "Materials used notes", kind: "textarea" },
      { key: "customer_feedback", label: "Customer feedback", kind: "textarea" },
      { key: "customer_signoff_text", label: "Customer signoff text", kind: "textarea" },
      { key: "followup_required", label: "Followup required", kind: "checkbox" },
      { key: "followup_notes", label: "Followup notes", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user", kind: "select", lookup: userLookup },
    ],
  },
} as const satisfies EntityConfigMap;

export const installationNavGroup: AdminNavGroup = {
  label: "Installation",
  items: [
    { href: "/admin/installation-jobs", label: "Installation Jobs" },
    { href: "/admin/installation-assignments", label: "Installation Assignments" },
    { href: "/admin/installation-results", label: "Installation Results" },
  ],
};
