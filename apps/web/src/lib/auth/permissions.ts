import type { AuthSession } from "@/lib/auth/shared";
import {
  BASELINE_ROLE_CATALOG,
  SYSTEM_PERMISSION_CATALOG,
  SYSTEM_PERMISSION_CODES,
} from "@one-technology/shared";

export const KNOWN_PERMISSION_CODES = [...SYSTEM_PERMISSION_CODES];

export type PermissionCode = (typeof SYSTEM_PERMISSION_CATALOG)[number]["code"];

type AccessRule = {
  anyOf?: string[];
  allOf?: string[];
};

const adminBaselinePermissions =
  BASELINE_ROLE_CATALOG.find((role) => role.code === "admin")?.permissionCodes ??
  KNOWN_PERMISSION_CODES;

export const ROLE_PERMISSION_PRESETS: Record<string, string[]> = {
  seller: ["dashboard.view", "sales.create", "sales.view_own", "documents.view", "installations.view"],
  sales: ["dashboard.view", "sales.create", "sales.view_own", "documents.view", "installations.view"],
  manager: ["dashboard.view", "sales.view_all", "approvals.review", "documents.view", "installations.view", "payments.view", "operations.view"],
  boss: ["dashboard.view", "sales.view_all", "approvals.review", "documents.view", "installations.view", "payments.view", "operations.view"],
  admin: [...adminBaselinePermissions],
  superadmin: [...adminBaselinePermissions],
  product_manager: ["dashboard.view", "products.manage"],
  catalog_manager: ["dashboard.view", "products.manage"],
  access_admin: ["dashboard.view", "users.manage", "roles.manage", "settings.manage"],
};

export const BOOTSTRAP_ADMIN_PERMISSIONS = [...adminBaselinePermissions] as readonly string[];

export const HREF_ACCESS_RULES: Array<{ prefix: string; rule: AccessRule }> = [
  { prefix: "/admin/new-sale", rule: { anyOf: ["sales.create"] } },
  { prefix: "/admin/my-sales", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/approvals", rule: { anyOf: ["approvals.review"] } },
  { prefix: "/admin/payments-debt", rule: { anyOf: ["payments.view"] } },
  { prefix: "/admin/expenses-adjustments", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/documents-lite", rule: { anyOf: ["documents.view"] } },
  { prefix: "/admin/installations-lite", rule: { anyOf: ["installations.view"] } },
  { prefix: "/admin/products", rule: { anyOf: ["products.manage"] } },
  { prefix: "/admin/product-", rule: { anyOf: ["products.manage"] } },
  { prefix: "/admin/catalog", rule: { anyOf: ["products.manage"] } },
  { prefix: "/admin/users", rule: { anyOf: ["users.manage"] } },
  { prefix: "/admin/user-roles", rule: { anyOf: ["users.manage", "roles.manage"] } },
  { prefix: "/admin/roles", rule: { anyOf: ["roles.manage"] } },
  { prefix: "/admin/permissions", rule: { anyOf: ["roles.manage", "settings.manage"] } },
  { prefix: "/admin/role-permissions", rule: { anyOf: ["roles.manage", "settings.manage"] } },
  { prefix: "/admin/commercial", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/quotes", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/quote-versions", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/orders", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/order-lines", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/order-discounts", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/quote-lines", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/quote-discounts", rule: { anyOf: ["sales.view_own", "sales.view_all"] } },
  { prefix: "/admin/payments", rule: { anyOf: ["payments.view"] } },
  { prefix: "/admin/payment-methods", rule: { anyOf: ["payments.view", "settings.manage"] } },
  { prefix: "/admin/documents", rule: { anyOf: ["documents.view"] } },
  { prefix: "/admin/document-", rule: { anyOf: ["documents.view"] } },
  { prefix: "/admin/generated-documents", rule: { anyOf: ["documents.view"] } },
  { prefix: "/admin/installation", rule: { anyOf: ["installations.view"] } },
  { prefix: "/admin/installation-", rule: { anyOf: ["installations.view"] } },
  { prefix: "/admin/warehouse", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/stock-", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/purchase-receipts", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/purchase-receipt-lines", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/inventory-count", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/warehouses", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/warehouse-positions", rule: { anyOf: ["operations.view"] } },
  { prefix: "/admin/constructor", rule: { anyOf: ["products.manage", "operations.view", "settings.manage"] } },
  { prefix: "/admin/door-configuration", rule: { anyOf: ["products.manage", "operations.view"] } },
  { prefix: "/admin/bom-", rule: { anyOf: ["products.manage", "operations.view"] } },
  { prefix: "/admin/calculation-runs", rule: { anyOf: ["products.manage", "operations.view"] } },
  { prefix: "/admin/spring-calculation-results", rule: { anyOf: ["products.manage", "operations.view"] } },
  { prefix: "/admin/branches", rule: { anyOf: ["settings.manage"] } },
  { prefix: "/admin/departments", rule: { anyOf: ["settings.manage"] } },
  { prefix: "/admin/employees", rule: { anyOf: ["settings.manage"] } },
  { prefix: "/admin/locations", rule: { anyOf: ["settings.manage"] } },
  { prefix: "/admin/suppliers", rule: { anyOf: ["products.manage", "operations.view"] } },
  { prefix: "/admin/units", rule: { anyOf: ["products.manage", "settings.manage"] } },
  { prefix: "/admin", rule: { anyOf: ["dashboard.view"] } },
];

export function normalizePermissionSet(values: Iterable<string>): string[] {
  return Array.from(new Set(Array.from(values).filter(Boolean).map((value) => value.trim()).filter(Boolean))).sort();
}

export function hasPermission(permissions: readonly string[] | undefined, permission: string): boolean {
  return Boolean(permissions?.includes(permission));
}

export function hasAnyPermission(permissions: readonly string[] | undefined, required: readonly string[]): boolean {
  if (!required.length) {
    return true;
  }
  return required.some((permission) => hasPermission(permissions, permission));
}

export function hasAllPermissions(permissions: readonly string[] | undefined, required: readonly string[]): boolean {
  if (!required.length) {
    return true;
  }
  return required.every((permission) => hasPermission(permissions, permission));
}

export function canAccessByRule(permissions: readonly string[] | undefined, rule?: AccessRule): boolean {
  if (!rule) {
    return true;
  }
  if (rule.allOf && !hasAllPermissions(permissions, rule.allOf)) {
    return false;
  }
  if (rule.anyOf && !hasAnyPermission(permissions, rule.anyOf)) {
    return false;
  }
  return true;
}

export function getAccessRuleForHref(href: string): AccessRule | undefined {
  const normalizedHref = href.trim();
  const match = HREF_ACCESS_RULES
    .filter(
      (entry) =>
        normalizedHref === entry.prefix ||
        normalizedHref.startsWith(`${entry.prefix}/`) ||
        (entry.prefix.endsWith("-") && normalizedHref.startsWith(entry.prefix))
    )
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  return match?.rule;
}

export function canAccessHref(permissions: readonly string[] | undefined, href: string): boolean {
  return canAccessByRule(permissions, getAccessRuleForHref(href));
}

export function canAccessSessionHref(session: Pick<AuthSession, "permissions"> | null | undefined, href: string): boolean {
  return canAccessHref(session?.permissions, href);
}

export function deriveWorkspaceDefaults(permissions: readonly string[] | undefined): {
  preferredMode: "easy" | "advanced";
  preferredEasyRole: "seller" | "boss";
} {
  const canRunBossWorkspace = hasAnyPermission(permissions, ["approvals.review", "payments.view", "operations.view"]);
  const canRunSellerWorkspace = hasAnyPermission(permissions, ["sales.create", "sales.view_own", "sales.view_all"]);
  const preferredMode = hasAnyPermission(permissions, ["products.manage", "users.manage", "roles.manage", "settings.manage"]) ? "advanced" : "easy";

  return {
    preferredMode,
    preferredEasyRole: canRunBossWorkspace && !canRunSellerWorkspace ? "boss" : "seller",
  };
}

export function canUseSellerWorkspace(permissions: readonly string[] | undefined): boolean {
  return hasAnyPermission(permissions, [
    "sales.create",
    "sales.view_own",
    "sales.view_all",
    "documents.view",
    "installations.view",
  ]);
}

export function canUseBossWorkspace(permissions: readonly string[] | undefined): boolean {
  return hasAnyPermission(permissions, [
    "approvals.review",
    "payments.view",
    "operations.view",
    "sales.view_all",
  ]);
}