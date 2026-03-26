export type SystemPermissionDefinition = {
  code: string;
  label: string;
  description: string;
  group: string;
};

export type BaselineRoleDefinition = {
  code: string;
  label: string;
  description: string;
  permissionCodes: readonly string[];
};

export const SYSTEM_PERMISSION_CATALOG = [
  {
    code: "dashboard.view",
    label: "View Dashboard",
    group: "dashboard",
    description: "Open the main ERP dashboard and workspace entry surfaces.",
  },
  {
    code: "sales.create",
    label: "Create Sales",
    group: "sales",
    description: "Start new sales from seller workflow pages and advanced commercial flows.",
  },
  {
    code: "sales.view_own",
    label: "View Own Sales",
    group: "sales",
    description: "View seller-facing sales that belong to the current user.",
  },
  {
    code: "sales.view_all",
    label: "View All Sales",
    group: "sales",
    description: "View the full commercial pipeline across quotes, orders, and related workflows.",
  },
  {
    code: "approvals.review",
    label: "Review Approvals",
    group: "approvals",
    description: "Open approval queues and make boss-side review decisions.",
  },
  {
    code: "documents.view",
    label: "View Documents",
    group: "documents",
    description: "Access generated documents, templates, previews, and document workflows.",
  },
  {
    code: "installations.view",
    label: "View Installations",
    group: "installations",
    description: "Access installation jobs, results, and installation workflow pages.",
  },
  {
    code: "payments.view",
    label: "View Payments",
    group: "payments",
    description: "Access payment records, debt visibility, and money follow-through surfaces.",
  },
  {
    code: "operations.view",
    label: "View Operations",
    group: "operations",
    description: "Access warehouse, reservations, stock movements, and operational exception views.",
  },
  {
    code: "products.manage",
    label: "Manage Products",
    group: "catalog",
    description: "Manage products, catalog structures, constructor-related product data, and setup.",
  },
  {
    code: "users.manage",
    label: "Manage Users",
    group: "admin",
    description: "Manage users and user lifecycle actions.",
  },
  {
    code: "roles.manage",
    label: "Manage Roles",
    group: "admin",
    description: "Manage roles, user-role assignments, permissions, and role-permission mappings.",
  },
  {
    code: "settings.manage",
    label: "Manage Settings",
    group: "admin",
    description: "Access broader settings and company or admin configuration surfaces.",
  },
] as const satisfies readonly SystemPermissionDefinition[];

export type SystemPermissionCode = (typeof SYSTEM_PERMISSION_CATALOG)[number]["code"];

export const SYSTEM_PERMISSION_CODES = SYSTEM_PERMISSION_CATALOG.map(
  (permission) => permission.code
) as readonly SystemPermissionCode[];

export const SYSTEM_PERMISSION_GROUPS = Array.from(
  new Set(SYSTEM_PERMISSION_CATALOG.map((permission) => permission.group))
);

export const BASELINE_ROLE_CATALOG = [
  {
    code: "admin",
    label: "Admin",
    description: "Full core ERP access for administration, setup, and operational oversight.",
    permissionCodes: [...SYSTEM_PERMISSION_CODES],
  },
  {
    code: "seller",
    label: "Seller",
    description: "Seller workflow access for day-to-day sales work and follow-through.",
    permissionCodes: [
      "dashboard.view",
      "sales.create",
      "sales.view_own",
      "documents.view",
      "installations.view",
    ],
  },
  {
    code: "boss",
    label: "Boss",
    description: "Management oversight access for approvals, money visibility, and operational control.",
    permissionCodes: [
      "dashboard.view",
      "sales.view_all",
      "approvals.review",
      "documents.view",
      "installations.view",
      "payments.view",
      "operations.view",
    ],
  },
] as const satisfies readonly BaselineRoleDefinition[];

export const SYSTEM_PERMISSION_CATALOG_BY_CODE = Object.fromEntries(
  SYSTEM_PERMISSION_CATALOG.map((permission) => [permission.code, permission])
) as Record<SystemPermissionCode, (typeof SYSTEM_PERMISSION_CATALOG)[number]>;