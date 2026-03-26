import type { AdminNavGroup, EntityConfigMap } from "./shared";
import {
  branchTypes,
  employeeTypes,
  locationTypes,
  permissionLookup,
  roleLookup,
  userLookup,
  userStatuses,
} from "./shared";

export const accessCompanyConfigs = {
  roles: {
    title: "Roles",
    apiPath: "/api/roles",
    viewPermissions: ["roles.manage"],
    createPermissions: ["roles.manage"],
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
    viewPermissions: ["roles.manage", "settings.manage"],
    createEnabled: false,
    listSection: {
      kicker: "Catalog",
      title: "System permission catalog",
      description:
        "Review the stable permission codes the ERP uses for navigation, page access, and action visibility.",
    },
    listNotice: {
      title: "System-managed catalog",
      description:
        "Core permission codes are synced from the app automatically. Use Roles and Role Permissions to assign access instead of creating permission codes by hand.",
      tone: "info",
    },
    tableColumns: [
      { key: "name", label: "Permission" },
      { key: "code", label: "Code" },
      { key: "module", label: "Group" },
      { key: "description", label: "Description" },
    ],
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "module", label: "Group", kind: "text", required: true },
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
    viewPermissions: ["users.manage"],
    createPermissions: ["users.manage"],
    listNotice: {
      title: "Deactivate instead of delete",
      description:
        "Keep login history and linked records intact by deactivating users rather than removing them.",
      tone: "warning",
    },
    recordActions: [
      {
        key: "deactivate",
        label: "Deactivate",
        tone: "warning",
        actionPathTemplate: "/api/users/:id/deactivate",
        requiredPermissions: ["users.manage"],
        confirmTitle: "Deactivate this user?",
        confirmDescription:
          "This keeps history and linked records, but the user should no longer be used for normal day-to-day work.",
        visibleWhen: { key: "status", notEquals: "inactive" },
        successMessageTemplate: "User {email|id} has been deactivated.",
      },
    ],
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
    viewPermissions: ["users.manage", "roles.manage"],
    createPermissions: ["users.manage", "roles.manage"],
    listNotice: {
      title: "Assign existing roles",
      description:
        "The baseline role catalog is synced automatically. Use this page to assign those roles to users rather than inventing permissions from scratch.",
      tone: "info",
    },
    fields: [
      { key: "user_id", label: "User", kind: "select", required: true, lookup: userLookup },
      { key: "role_id", label: "Role", kind: "select", required: true, lookup: roleLookup },
    ],
  },
  role_permissions: {
    title: "Role permissions",
    apiPath: "/api/role-permissions",
    viewPermissions: ["roles.manage", "settings.manage"],
    createPermissions: ["roles.manage", "settings.manage"],
    listNotice: {
      title: "Work from the catalog",
      description:
        "The permission catalog is system-managed and auto-synced. Use this page to decide which existing permissions each role should carry.",
      tone: "info",
    },
    fields: [
      { key: "role_id", label: "Role", kind: "select", required: true, lookup: roleLookup },
      { key: "permission_id", label: "Permission", kind: "select", required: true, lookup: permissionLookup },
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