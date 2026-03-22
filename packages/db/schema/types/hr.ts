/**
 * HR structure: departments and employees.
 * Employees may exist without a linked user (e.g. installers in V1); user_id is optional.
 */

export const TABLE_DEPARTMENTS = "departments" as const;
export const TABLE_EMPLOYEES = "employees" as const;

export type EmployeeType = "office" | "sales" | "installer" | "admin" | "mixed";

export interface DepartmentRow {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeRow {
  id: number;
  /** ERP login account when the person is also a system user; null for non-users (e.g. installers). */
  user_id: number | null;
  department_id: number | null;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  job_title: string | null;
  employee_type: EmployeeType;
  hire_date: string | null;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
