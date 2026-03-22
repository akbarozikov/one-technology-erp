export type FieldKind = "text" | "textarea" | "number" | "checkbox" | "select";

export type EntityField = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** For checkboxes: initial checked when creating a new row */
  defaultChecked?: boolean;
  options?: { value: string; label: string }[];
};

export type EntityConfig = {
  title: string;
  /** Worker path, e.g. /api/roles */
  apiPath: string;
  fields: EntityField[];
};

const userStatuses = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
  { value: "suspended", label: "suspended" },
];

const employeeTypes = [
  { value: "office", label: "office" },
  { value: "sales", label: "sales" },
  { value: "installer", label: "installer" },
  { value: "admin", label: "admin" },
  { value: "mixed", label: "mixed" },
];

const branchTypes = [
  { value: "office", label: "office" },
  { value: "showroom", label: "showroom" },
  { value: "warehouse_branch", label: "warehouse_branch" },
  { value: "partner_point", label: "partner_point" },
  { value: "mixed", label: "mixed" },
];

const locationTypes = [
  { value: "office", label: "office" },
  { value: "warehouse", label: "warehouse" },
  { value: "showroom", label: "showroom" },
  { value: "partner_stock_point", label: "partner_stock_point" },
];

const warehouseTypes = [
  { value: "main", label: "main" },
  { value: "secondary", label: "secondary" },
  { value: "partner", label: "partner" },
  { value: "temporary", label: "temporary" },
];

const positionTypes = [
  { value: "zone", label: "zone" },
  { value: "rack", label: "rack" },
  { value: "shelf", label: "shelf" },
  { value: "floor_area", label: "floor_area" },
  { value: "virtual", label: "virtual" },
];

export const entityConfigs = {
  roles: {
    title: "Roles",
    apiPath: "/api/roles",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
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
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  users: {
    title: "Users",
    apiPath: "/api/users",
    fields: [
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text" },
      {
        key: "password_hash",
        label: "Password hash (placeholder)",
        kind: "text",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: userStatuses,
      },
    ],
  },
  user_roles: {
    title: "User roles",
    apiPath: "/api/user-roles",
    fields: [
      {
        key: "user_id",
        label: "User ID",
        kind: "number",
        required: true,
      },
      {
        key: "role_id",
        label: "Role ID",
        kind: "number",
        required: true,
      },
    ],
  },
  role_permissions: {
    title: "Role permissions",
    apiPath: "/api/role-permissions",
    fields: [
      {
        key: "role_id",
        label: "Role ID",
        kind: "number",
        required: true,
      },
      {
        key: "permission_id",
        label: "Permission ID",
        kind: "number",
        required: true,
      },
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
      {
        key: "employee_type",
        label: "Employee type",
        kind: "select",
        required: true,
        options: employeeTypes,
      },
      { key: "hire_date", label: "Hire date", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  branches: {
    title: "Branches",
    apiPath: "/api/branches",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "branch_type",
        label: "Branch type",
        kind: "select",
        required: true,
        options: branchTypes,
      },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  locations: {
    title: "Locations",
    apiPath: "/api/locations",
    fields: [
      {
        key: "branch_id",
        label: "Branch ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "location_type",
        label: "Location type",
        kind: "select",
        required: true,
        options: locationTypes,
      },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  warehouses: {
    title: "Warehouses",
    apiPath: "/api/warehouses",
    fields: [
      {
        key: "location_id",
        label: "Location ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "warehouse_type",
        label: "Warehouse type",
        kind: "select",
        required: true,
        options: warehouseTypes,
      },
      {
        key: "is_external",
        label: "External",
        kind: "checkbox",
      },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  warehouse_positions: {
    title: "Warehouse positions",
    apiPath: "/api/warehouse-positions",
    fields: [
      {
        key: "warehouse_id",
        label: "Warehouse ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "position_type",
        label: "Position type",
        kind: "select",
        required: true,
        options: positionTypes,
      },
      { key: "parent_position_id", label: "Parent position ID", kind: "number" },
      { key: "sort_order", label: "Sort order", kind: "number" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
} as const satisfies Record<string, EntityConfig>;

export type EntityKey = keyof typeof entityConfigs;

export const adminNav: { href: string; label: string }[] = [
  { href: "/admin/roles", label: "Roles" },
  { href: "/admin/permissions", label: "Permissions" },
  { href: "/admin/user-roles", label: "User Roles" },
  { href: "/admin/role-permissions", label: "Role Permissions" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/warehouses", label: "Warehouses" },
  { href: "/admin/warehouse-positions", label: "Warehouse positions" },
];
