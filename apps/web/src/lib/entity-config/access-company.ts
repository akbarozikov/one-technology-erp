import type { AdminNavGroup, EntityConfigMap } from "./shared";
import { branchTypes, employeeTypes, locationTypes, userStatuses } from "./shared";

export const accessCompanyConfigs = {
  roles: {
    title: "Roles",
    apiPath: "/api/roles",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
    ],
  },
  permissions: {
    title: "Permissions",
    apiPath: "/api/permissions",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "module", label: "Module", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
    ],
  },
  departments: {
    title: "Departments",
    apiPath: "/api/departments",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
    ],
  },
  users: {
    title: "Users",
    apiPath: "/api/users",
    fields: [
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "password_hash", label: "Password hash (placeholder)", kind: "text", required: true },
      { key: "status", label: "Status", kind: "select", options: userStatuses },
    ],
  },
  user_roles: {
    title: "User roles",
    apiPath: "/api/user-roles",
    fields: [
      { key: "user_id", label: "User ID", kind: "number", required: true },
      { key: "role_id", label: "Role ID", kind: "number", required: true },
    ],
  },
  role_permissions: {
    title: "Role permissions",
    apiPath: "/api/role-permissions",
    fields: [
      { key: "role_id", label: "Role ID", kind: "number", required: true },
      { key: "permission_id", label: "Permission ID", kind: "number", required: true },
    ],
  },
  employees: {
    title: "Employees",
    apiPath: "/api/employees",
    fields: [
      { key: "user_id", label: "User ID", kind: "number" },
      { key: "department_id", label: "Department ID", kind: "number" },
      { key: "first_name", label: "First name", kind: "text", required: true },
      { key: "last_name", label: "Last name", kind: "text", required: true },
      { key: "full_name", label: "Full name", kind: "text", required: true },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "job_title", label: "Job title", kind: "text" },
      { key: "employee_type", label: "Employee type", kind: "select", required: true, options: employeeTypes },
      { key: "hire_date", label: "Hire date", kind: "date" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  branches: {
    title: "Branches",
    apiPath: "/api/branches",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "branch_type", label: "Branch type", kind: "select", required: true, options: branchTypes },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  locations: {
    title: "Locations",
    apiPath: "/api/locations",
    fields: [
      { key: "branch_id", label: "Branch ID", kind: "number", required: true },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "location_type", label: "Location type", kind: "select", required: true, options: locationTypes },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
} as const satisfies EntityConfigMap;

export const accessCompanyNavGroup: AdminNavGroup = {
  label: "Admin / Settings",
  items: [
    { href: "/admin/users", label: "Users" },
    { href: "/admin/employees", label: "Employees" },
    { href: "/admin/departments", label: "Departments" },
    { href: "/admin/branches", label: "Branches" },
    { href: "/admin/locations", label: "Locations" },
    { href: "/admin/roles", label: "Roles" },
    { href: "/admin/permissions", label: "Permissions" },
    { href: "/admin/user-roles", label: "User Roles" },
    { href: "/admin/role-permissions", label: "Role Permissions" },
  ],
};
