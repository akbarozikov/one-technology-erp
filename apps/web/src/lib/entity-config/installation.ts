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
    detailBasePath: "/admin/installation-jobs",
    detailLabelKey: "job_number",
    searchKeys: ["job_number", "contact_name", "contact_phone", "notes"],
    filters: [
      { key: "job_status", label: "Job status", options: installationJobStatuses },
      { key: "job_type", label: "Job type", options: installationJobTypes },
    ],
    formSections: [
      { key: "core", label: "Core Info" },
      { key: "schedule", label: "Scheduling" },
      { key: "contact", label: "Contact / Location" },
      { key: "notes", label: "Notes / Context" },
    ],
    fields: [
      { key: "order_id", label: "Order", kind: "select", lookup: orderLookup, section: "core" },
      { key: "order_line_id", label: "Order line ID", kind: "number", section: "core" },
      { key: "job_number", label: "Job number", kind: "text", required: true, section: "core" },
      { key: "job_type", label: "Job type", kind: "select", required: true, options: installationJobTypes, section: "core" },
      { key: "job_status", label: "Job status", kind: "select", options: installationJobStatuses, section: "schedule" },
      { key: "planned_date", label: "Planned date", kind: "date", section: "schedule" },
      { key: "scheduled_time_from", label: "Scheduled time from", kind: "text", section: "schedule" },
      { key: "scheduled_time_to", label: "Scheduled time to", kind: "text", section: "schedule" },
      { key: "actual_started_at", label: "Actual started at", kind: "datetime-local", section: "schedule" },
      { key: "actual_completed_at", label: "Actual completed at", kind: "datetime-local", section: "schedule" },
      { key: "address_text", label: "Address", kind: "textarea", section: "contact" },
      { key: "city", label: "City", kind: "text", section: "contact" },
      { key: "contact_name", label: "Contact name", kind: "text", section: "contact" },
      { key: "contact_phone", label: "Contact phone", kind: "text", section: "contact" },
      { key: "notes", label: "Notes", kind: "textarea", section: "notes" },
      { key: "created_by_user_id", label: "Created by user", kind: "select", lookup: userLookup, section: "notes" },
      { key: "approved_by_user_id", label: "Approved by user", kind: "select", lookup: userLookup, section: "notes" },
      { key: "completed_by_user_id", label: "Completed by user", kind: "select", lookup: userLookup, section: "notes" },
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
  href: "/admin/installation",
  items: [
    { href: "/admin/installation-jobs", label: "Installation Jobs" },
    { href: "/admin/installation-results", label: "Installation Results" },
    { href: "/admin/installation-assignments", label: "Installation Assignments" },
  ],
};
