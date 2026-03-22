/**
 * Access control: roles, permissions, and user assignments.
 * Users and roles are linked via user_roles; permissions attach to roles via role_permissions.
 */

export const TABLE_ROLES = "roles" as const;
export const TABLE_PERMISSIONS = "permissions" as const;
export const TABLE_ROLE_PERMISSIONS = "role_permissions" as const;
export const TABLE_USERS = "users" as const;
export const TABLE_USER_ROLES = "user_roles" as const;

/** Login account lifecycle (distinct from employee records). */
export type UserStatus = "active" | "inactive" | "suspended";

export interface RoleRow {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PermissionRow {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionRow {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: string;
}

export interface UserRow {
  id: number;
  /** Unique when not null (see migration). */
  email: string | null;
  /** Unique when not null (see migration). */
  phone: string | null;
  password_hash: string;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: number;
  user_id: number;
  role_id: number;
  created_at: string;
}
