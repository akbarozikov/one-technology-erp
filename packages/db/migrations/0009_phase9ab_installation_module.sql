-- Phase 9AB: installation module foundation.
-- Stores installation jobs, assignments, and historical results without scheduling UI or automation.

PRAGMA foreign_keys = ON;

CREATE TABLE installation_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders (id) ON DELETE SET NULL,
  order_line_id INTEGER REFERENCES order_lines (id) ON DELETE SET NULL,
  job_number TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK (
    job_type IN ('installation', 'service', 'inspection', 'revisit')
  ),
  job_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    job_status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed')
  ),
  planned_date TEXT,
  scheduled_time_from TEXT,
  scheduled_time_to TEXT,
  actual_started_at TEXT,
  actual_completed_at TEXT,
  address_text TEXT,
  city TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  completed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE installation_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_job_id INTEGER NOT NULL REFERENCES installation_jobs (id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  assignment_role TEXT NOT NULL CHECK (
    assignment_role IN ('lead_installer', 'installer', 'technician', 'assistant')
  ),
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE installation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_job_id INTEGER NOT NULL REFERENCES installation_jobs (id) ON DELETE CASCADE,
  result_status TEXT NOT NULL CHECK (
    result_status IN ('completed', 'partial', 'failed', 'revisit_required')
  ),
  completion_date TEXT,
  work_summary TEXT,
  issues_found TEXT,
  materials_used_notes TEXT,
  customer_feedback TEXT,
  customer_signoff_text TEXT,
  followup_required INTEGER NOT NULL DEFAULT 0 CHECK (followup_required IN (0, 1)),
  followup_notes TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_installation_jobs_order ON installation_jobs (order_id);
CREATE INDEX idx_installation_jobs_order_line ON installation_jobs (order_line_id);
CREATE INDEX idx_installation_jobs_status ON installation_jobs (job_status);
CREATE INDEX idx_installation_jobs_planned_date ON installation_jobs (planned_date);
CREATE INDEX idx_installation_jobs_created_by ON installation_jobs (created_by_user_id);
CREATE INDEX idx_installation_jobs_approved_by ON installation_jobs (approved_by_user_id);
CREATE INDEX idx_installation_jobs_completed_by ON installation_jobs (completed_by_user_id);

CREATE INDEX idx_installation_assignments_job ON installation_assignments (installation_job_id);
CREATE INDEX idx_installation_assignments_employee ON installation_assignments (employee_id);
CREATE INDEX idx_installation_assignments_role ON installation_assignments (assignment_role);

CREATE INDEX idx_installation_results_job ON installation_results (installation_job_id);
CREATE INDEX idx_installation_results_status ON installation_results (result_status);
CREATE INDEX idx_installation_results_completion_date ON installation_results (completion_date);
CREATE INDEX idx_installation_results_created_by ON installation_results (created_by_user_id);
