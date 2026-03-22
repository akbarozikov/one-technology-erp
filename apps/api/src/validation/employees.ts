import type { EmployeeType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalNullableFk,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
} from "./helpers";

const EMPLOYEE_TYPES: readonly EmployeeType[] = [
  "office",
  "sales",
  "installer",
  "admin",
  "mixed",
];

export interface EmployeeCreateInput {
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
  is_active: 0 | 1;
  notes: string | null;
}

export function parseEmployeeCreate(
  body: JsonObject,
  errors: Failures
): EmployeeCreateInput | null {
  const first_name = requireNonEmptyString(body, "first_name", errors);
  const last_name = requireNonEmptyString(body, "last_name", errors);
  const full_name = requireNonEmptyString(body, "full_name", errors);
  const employee_type = requireEnum(body, "employee_type", EMPLOYEE_TYPES, errors);
  const user_id = optionalNullableFk(body, "user_id", errors);
  const department_id = optionalNullableFk(body, "department_id", errors);
  const phone = optionalTrimmedString(body, "phone", errors);
  const email = optionalTrimmedString(body, "email", errors);
  const job_title = optionalTrimmedString(body, "job_title", errors);
  const hire_date = optionalTrimmedString(body, "hire_date", errors);
  const notes = optionalTrimmedString(body, "notes", errors);
  const is_active = optionalBoolAsInt(body, "is_active", 1, errors);

  if (
    first_name === null ||
    last_name === null ||
    full_name === null ||
    employee_type === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    user_id,
    department_id,
    first_name,
    last_name,
    full_name,
    phone: phone === undefined ? null : phone,
    email: email === undefined ? null : email,
    job_title: job_title === undefined ? null : job_title,
    employee_type,
    hire_date: hire_date === undefined ? null : hire_date,
    is_active,
    notes: notes === undefined ? null : notes,
  };
}
