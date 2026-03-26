import type {
  PermissionRow,
  RolePermissionRow,
  RoleRow,
  UserRoleRow,
  UserRow,
} from "@one-technology/db";
import {
  BASELINE_ROLE_CATALOG,
  SYSTEM_PERMISSION_CATALOG,
} from "@one-technology/shared";
import { getDb } from "./db";
import type { Env } from "../types/env";

type PermissionSeed = (typeof SYSTEM_PERMISSION_CATALOG)[number];
type RoleSeed = (typeof BASELINE_ROLE_CATALOG)[number];

export type AccessBootstrapSummary = {
  permissions_created: number;
  permissions_updated: number;
  roles_created: number;
  roles_updated: number;
  role_permissions_created: number;
  user_roles_created: number;
  admin_user_status_changed: boolean;
};

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
      .bind(seed.label, seed.code, seed.group, seed.description)
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
    existing.name !== seed.label ||
    existing.module !== seed.group ||
    (existing.description ?? null) !== seed.description
  ) {
    const updated = await db
      .prepare(
        `UPDATE permissions
         SET name = ?, module = ?, description = ?, updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
      .bind(seed.label, seed.group, seed.description, existing.id)
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
  const normalizedName = normalizeIdentifier(seed.label);

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
      .bind(seed.label, seed.code, seed.description)
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
    existing.name !== seed.label ||
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
      .bind(seed.label, seed.code, seed.description, existing.id)
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
  for (const permissionSeed of SYSTEM_PERMISSION_CATALOG) {
    const permission = await ensurePermission(db, permissionSeed, summary);
    permissionsByCode.set(permission.code, permission);
  }

  const rolesByCode = new Map<string, RoleRow>();
  for (const roleSeed of BASELINE_ROLE_CATALOG) {
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
    permissions: SYSTEM_PERMISSION_CATALOG.map((permission) => permission.code),
    roles: BASELINE_ROLE_CATALOG.map((role) => ({
      code: role.code,
      permission_codes: [...role.permissionCodes],
    })),
    admin_identifier: adminIdentifier,
    admin_user: adminUser,
    summary,
  };
}