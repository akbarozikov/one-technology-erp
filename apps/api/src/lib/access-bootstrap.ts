import type {
  PermissionRow,
  RolePermissionRow,
  RoleRow,
  UserRoleRow,
  UserRow,
} from "@one-technology/db";
import { getDb } from "./db";
import type { Env } from "../types/env";

type PermissionSeed = {
  code: string;
  name: string;
  module: string;
  description: string;
};

type RoleSeed = {
  code: string;
  name: string;
  description: string;
  permissionCodes: string[];
};

export type AccessBootstrapSummary = {
  permissions_created: number;
  permissions_updated: number;
  roles_created: number;
  roles_updated: number;
  role_permissions_created: number;
  user_roles_created: number;
  admin_user_status_changed: boolean;
};

export const APP_PERMISSION_SEEDS: PermissionSeed[] = [
  {
    code: "dashboard.view",
    name: "View Dashboard",
    module: "dashboard",
    description: "Open the main ERP dashboard and workspace entry surfaces.",
  },
  {
    code: "sales.create",
    name: "Create Sales",
    module: "sales",
    description: "Start new sales from the seller workflow and advanced commercial flows.",
  },
  {
    code: "sales.view_own",
    name: "View Own Sales",
    module: "sales",
    description: "View seller-facing sales that belong to the current user.",
  },
  {
    code: "sales.view_all",
    name: "View All Sales",
    module: "sales",
    description: "View the full commercial pipeline across quotes, versions, orders, and related workflows.",
  },
  {
    code: "approvals.review",
    name: "Review Approvals",
    module: "approvals",
    description: "Open boss approval queues and make sales decisions.",
  },
  {
    code: "documents.view",
    name: "View Documents",
    module: "documents",
    description: "Access generated documents, document templates, and document preview surfaces.",
  },
  {
    code: "installations.view",
    name: "View Installations",
    module: "installations",
    description: "Access installation jobs, results, and installation-oriented workflow pages.",
  },
  {
    code: "payments.view",
    name: "View Payments",
    module: "payments",
    description: "Access payment records, debt visibility, and money follow-through surfaces.",
  },
  {
    code: "operations.view",
    name: "View Operations",
    module: "operations",
    description: "Access warehouse, reservations, stock movements, and operational exception views.",
  },
  {
    code: "products.manage",
    name: "Manage Products",
    module: "catalog",
    description: "Manage products, catalog structures, constructor-related product data, and related setup.",
  },
  {
    code: "users.manage",
    name: "Manage Users",
    module: "admin",
    description: "Manage users and user lifecycle actions.",
  },
  {
    code: "roles.manage",
    name: "Manage Roles",
    module: "admin",
    description: "Manage roles, user-role assignments, permissions, and role-permission mappings.",
  },
  {
    code: "settings.manage",
    name: "Manage Settings",
    module: "admin",
    description: "Access broader settings and company/admin configuration surfaces.",
  },
];

export const BASELINE_ROLE_SEEDS: RoleSeed[] = [
  {
    code: "admin",
    name: "Admin",
    description: "Full core ERP access for administration, setup, and operational oversight.",
    permissionCodes: APP_PERMISSION_SEEDS.map((permission) => permission.code),
  },
  {
    code: "seller",
    name: "Seller",
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
    name: "Boss",
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
];

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function getBootstrapToken(env: Env): string | null {
  return env.ERP_ACCESS_BOOTSTRAP_TOKEN?.trim() || null;
}

export function getBootstrapAdminIdentifier(env: Env): string | null {
  return (
    env.ERP_ACCESS_BOOTSTRAP_ADMIN_IDENTIFIER?.trim() ||
    env.ERP_AUTH_IDENTIFIER?.trim() ||
    null
  );
}

function createSummary(): AccessBootstrapSummary {
  return {
    permissions_created: 0,
    permissions_updated: 0,
    roles_created: 0,
    roles_updated: 0,
    role_permissions_created: 0,
    user_roles_created: 0,
    admin_user_status_changed: false,
  };
}

async function ensurePermission(
  db: D1Database,
  seed: PermissionSeed,
  summary: AccessBootstrapSummary
): Promise<PermissionRow> {
  const existing = await db
    .prepare("SELECT * FROM permissions WHERE code = ? LIMIT 1")
    .bind(seed.code)
    .first<PermissionRow>();

  if (!existing) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO permissions (name, code, module, description)
         VALUES (?, ?, ?, ?)`
      )
      .bind(seed.name, seed.code, seed.module, seed.description)
      .run();

    const created = await db
      .prepare("SELECT * FROM permissions WHERE code = ? LIMIT 1")
      .bind(seed.code)
      .first<PermissionRow>();

    if (!created) {
      throw new Error(`Failed to create permission ${seed.code}`);
    }

    summary.permissions_created += 1;
    return created;
  }

  if (
    existing.name !== seed.name ||
    existing.module !== seed.module ||
    (existing.description ?? null) !== seed.description
  ) {
    const updated = await db
      .prepare(
        `UPDATE permissions
         SET name = ?, module = ?, description = ?, updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(seed.name, seed.module, seed.description, existing.id)
      .first<PermissionRow>();

    if (!updated) {
      throw new Error(`Failed to update permission ${seed.code}`);
    }

    summary.permissions_updated += 1;
    return updated;
  }

  return existing;
}

async function ensureRole(
  db: D1Database,
  seed: RoleSeed,
  summary: AccessBootstrapSummary
): Promise<RoleRow> {
  const normalizedCode = normalizeIdentifier(seed.code);
  const normalizedName = normalizeIdentifier(seed.name);

  const existing = await db
    .prepare(
      `SELECT * FROM roles
       WHERE lower(code) = ? OR lower(name) = ?
       ORDER BY CASE WHEN lower(code) = ? THEN 0 ELSE 1 END, id ASC
       LIMIT 1`
    )
    .bind(normalizedCode, normalizedName, normalizedCode)
    .first<RoleRow>();

  if (!existing) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO roles (name, code, description, is_active)
         VALUES (?, ?, ?, 1)`
      )
      .bind(seed.name, seed.code, seed.description)
      .run();

    const created = await db
      .prepare(
        `SELECT * FROM roles
         WHERE lower(code) = ? OR lower(name) = ?
         ORDER BY CASE WHEN lower(code) = ? THEN 0 ELSE 1 END, id ASC
         LIMIT 1`
      )
      .bind(normalizedCode, normalizedName, normalizedCode)
      .first<RoleRow>();

    if (!created) {
      throw new Error(`Failed to create role ${seed.code}`);
    }

    summary.roles_created += 1;
    return created;
  }

  if (
    existing.name !== seed.name ||
    existing.code !== seed.code ||
    (existing.description ?? null) !== seed.description ||
    Number(existing.is_active) !== 1
  ) {
    const updated = await db
      .prepare(
        `UPDATE roles
         SET name = ?, code = ?, description = ?, is_active = 1, updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(seed.name, seed.code, seed.description, existing.id)
      .first<RoleRow>();

    if (!updated) {
      throw new Error(`Failed to update role ${seed.code}`);
    }

    summary.roles_updated += 1;
    return updated;
  }

  return existing;
}

async function ensureRolePermission(
  db: D1Database,
  roleId: number,
  permissionId: number,
  summary: AccessBootstrapSummary
): Promise<void> {
  const existing = await db
    .prepare(
      "SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1"
    )
    .bind(roleId, permissionId)
    .first<{ id: number }>();

  if (existing) {
    return;
  }

  await db
    .prepare(
      `INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
       VALUES (?, ?)`
    )
    .bind(roleId, permissionId)
    .run();

  const created = await db
    .prepare(
      "SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1"
    )
    .bind(roleId, permissionId)
    .first<RolePermissionRow>();

  if (!created) {
    throw new Error(`Failed to assign permission ${permissionId} to role ${roleId}`);
  }

  summary.role_permissions_created += 1;
}

async function ensureUserRole(
  db: D1Database,
  userId: number,
  roleId: number,
  summary: AccessBootstrapSummary
): Promise<void> {
  const existing = await db
    .prepare("SELECT id FROM user_roles WHERE user_id = ? AND role_id = ? LIMIT 1")
    .bind(userId, roleId)
    .first<{ id: number }>();

  if (existing) {
    return;
  }

  await db
    .prepare(
      `INSERT OR IGNORE INTO user_roles (user_id, role_id)
       VALUES (?, ?)`
    )
    .bind(userId, roleId)
    .run();

  const created = await db
    .prepare("SELECT * FROM user_roles WHERE user_id = ? AND role_id = ? LIMIT 1")
    .bind(userId, roleId)
    .first<UserRoleRow>();

  if (!created) {
    throw new Error(`Failed to assign role ${roleId} to user ${userId}`);
  }

  summary.user_roles_created += 1;
}

async function findUserByIdentifier(
  db: D1Database,
  identifier: string
): Promise<UserRow | null> {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) {
    return null;
  }

  return db
    .prepare(
      `SELECT * FROM users
       WHERE lower(email) = ? OR lower(phone) = ?
       LIMIT 1`
    )
    .bind(normalized, normalized)
    .first<UserRow>();
}

async function ensureActiveUser(
  db: D1Database,
  user: UserRow,
  summary: AccessBootstrapSummary
): Promise<UserRow> {
  if (user.status === "active") {
    return user;
  }

  const updated = await db
    .prepare(
      `UPDATE users
       SET status = 'active', updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(user.id)
    .first<UserRow>();

  if (!updated) {
    throw new Error(`Failed to activate user ${user.id}`);
  }

  summary.admin_user_status_changed = true;
  return updated;
}

export async function ensureAccessBaseline(
  env: Env,
  options?: { adminIdentifier?: string | null }
): Promise<{
  permissions: string[];
  roles: Array<{ code: string; permission_codes: string[] }>;
  admin_identifier: string | null;
  admin_user: {
    id: number;
    email: string | null;
    phone: string | null;
    status: string;
    admin_role_assigned: boolean;
  } | null;
  summary: AccessBootstrapSummary;
}> {
  const db = getDb(env);
  const summary = createSummary();

  const permissionsByCode = new Map<string, PermissionRow>();
  for (const permissionSeed of APP_PERMISSION_SEEDS) {
    const permission = await ensurePermission(db, permissionSeed, summary);
    permissionsByCode.set(permission.code, permission);
  }

  const rolesByCode = new Map<string, RoleRow>();
  for (const roleSeed of BASELINE_ROLE_SEEDS) {
    const role = await ensureRole(db, roleSeed, summary);
    rolesByCode.set(role.code, role);

    for (const permissionCode of roleSeed.permissionCodes) {
      const permission = permissionsByCode.get(permissionCode);
      if (!permission) {
        throw new Error(`Missing seeded permission ${permissionCode}`);
      }
      await ensureRolePermission(db, role.id, permission.id, summary);
    }
  }

  const adminIdentifier = options?.adminIdentifier?.trim() || getBootstrapAdminIdentifier(env) || null;
  let adminUser: {
    id: number;
    email: string | null;
    phone: string | null;
    status: string;
    admin_role_assigned: boolean;
  } | null = null;

  if (adminIdentifier) {
    const existingUser = await findUserByIdentifier(db, adminIdentifier);
    if (existingUser) {
      const activeUser = await ensureActiveUser(db, existingUser, summary);
      const adminRole = rolesByCode.get("admin");
      if (!adminRole) {
        throw new Error("Admin role was not available after baseline seeding.");
      }

      await ensureUserRole(db, activeUser.id, adminRole.id, summary);
      adminUser = {
        id: activeUser.id,
        email: activeUser.email,
        phone: activeUser.phone,
        status: activeUser.status,
        admin_role_assigned: true,
      };
    }
  }

  return {
    permissions: APP_PERMISSION_SEEDS.map((permission) => permission.code),
    roles: BASELINE_ROLE_SEEDS.map((role) => ({
      code: role.code,
      permission_codes: role.permissionCodes,
    })),
    admin_identifier: adminIdentifier,
    admin_user: adminUser,
    summary,
  };
}
