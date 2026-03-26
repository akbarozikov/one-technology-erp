import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  BOOTSTRAP_ADMIN_PERMISSIONS,
  deriveWorkspaceDefaults,
  normalizePermissionSet,
  ROLE_PERMISSION_PRESETS,
} from "@/lib/auth/permissions";
import {
  AUTH_COOKIE_NAME,
  type AuthSession,
  type ConfiguredAuthUser,
} from "@/lib/auth/shared";

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

type UserRow = {
  id: number;
  email: string | null;
  phone: string | null;
  status: string;
};

type UserRoleRow = {
  user_id: number;
  role_id: number;
};

type RoleRow = {
  id: number;
  code: string | null;
  name: string | null;
  is_active?: number | boolean | null;
};

type RolePermissionRow = {
  role_id: number;
  permission_id: number;
};

type PermissionRow = {
  id: number;
  code: string | null;
};

type ResolvedAccessProfile = Omit<AuthSession, "issuedAt">;

function getApiBaseUrl(): string | null {
  const value = process.env.ERP_API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    return null;
  }
  return value.replace(/\/$/, "");
}

function getSigningSecret(): string | null {
  const explicitSecret = process.env.ERP_AUTH_SECRET?.trim();
  if (explicitSecret) {
    return explicitSecret;
  }

  const passwordFallback = process.env.ERP_AUTH_PASSWORD?.trim();
  if (passwordFallback) {
    return passwordFallback;
  }

  return null;
}

function isBootstrapAccessEnabled(): boolean {
  return process.env.ERP_AUTH_BOOTSTRAP_ACCESS_ENABLED?.trim().toLowerCase() === "true";
}

function buildBootstrapAccessProfile(user: ConfiguredAuthUser): ResolvedAccessProfile {
  const permissions = normalizePermissionSet(BOOTSTRAP_ADMIN_PERMISSIONS);
  const derivedDefaults = deriveWorkspaceDefaults(permissions);

  return {
    userId: -1,
    identifier: user.identifier,
    name: user.name?.trim() || user.identifier,
    roleCodes: ["bootstrap_admin"],
    permissions,
    bootstrapAccess: true,
    preferredMode: user.preferredMode ?? derivedDefaults.preferredMode,
    preferredEasyRole: user.preferredEasyRole ?? derivedDefaults.preferredEasyRole,
  };
}

async function fetchApiList<T>(path: string): Promise<T[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL or ERP_API_BASE_URL is required for role and permission resolution.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to resolve access data from ${path}.`);
  }

  const payload = (await response.json()) as { data?: unknown };
  return Array.isArray(payload.data) ? (payload.data as T[]) : [];
}

export function getConfiguredAuthUsers(): ConfiguredAuthUser[] {
  const json = process.env.ERP_AUTH_USERS_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") {
          return [];
        }

        const record = item as Record<string, unknown>;
        const identifier = typeof record.identifier === "string" ? record.identifier.trim() : "";
        const password = typeof record.password === "string" ? record.password : "";
        if (!identifier || !password) {
          return [];
        }

        const preferredMode =
          record.preferredMode === "easy" || record.preferredMode === "advanced"
            ? record.preferredMode
            : undefined;
        const preferredEasyRole =
          record.preferredEasyRole === "seller" || record.preferredEasyRole === "boss"
            ? record.preferredEasyRole
            : undefined;

        return [
          {
            identifier,
            password,
            name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : identifier,
            bootstrapAdmin: record.bootstrapAdmin === true,
            preferredMode,
            preferredEasyRole,
          } satisfies ConfiguredAuthUser,
        ];
      });
    } catch {
      return [];
    }
  }

  const identifier = process.env.ERP_AUTH_IDENTIFIER?.trim();
  const password = process.env.ERP_AUTH_PASSWORD?.trim();
  if (!identifier || !password) {
    return [];
  }

  const preferredMode =
    process.env.ERP_AUTH_PREFERRED_MODE === "easy" || process.env.ERP_AUTH_PREFERRED_MODE === "advanced"
      ? process.env.ERP_AUTH_PREFERRED_MODE
      : undefined;
  const preferredEasyRole =
    process.env.ERP_AUTH_PREFERRED_EASY_ROLE === "seller" || process.env.ERP_AUTH_PREFERRED_EASY_ROLE === "boss"
      ? process.env.ERP_AUTH_PREFERRED_EASY_ROLE
      : undefined;

  return [
    {
      identifier,
      password,
      name: process.env.ERP_AUTH_NAME?.trim() || identifier,
      bootstrapAdmin: process.env.ERP_AUTH_BOOTSTRAP_ADMIN?.trim().toLowerCase() === "true",
      preferredMode,
      preferredEasyRole,
    },
  ];
}

export function getAuthConfigurationError(): string | null {
  if (getConfiguredAuthUsers().length === 0) {
    return "Authentication is not configured. Set ERP_AUTH_USERS_JSON or ERP_AUTH_IDENTIFIER and ERP_AUTH_PASSWORD.";
  }

  if (!getSigningSecret()) {
    return "Authentication secret is missing. Set ERP_AUTH_SECRET for staging deployments.";
  }

  if (!getApiBaseUrl()) {
    return "Role and permission resolution needs NEXT_PUBLIC_API_BASE_URL or ERP_API_BASE_URL.";
  }

  return null;
}

function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionToken(session: Omit<AuthSession, "issuedAt">): string {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("Authentication secret is not configured.");
  }

  const payload: AuthSession = {
    ...session,
    issuedAt: new Date().toISOString(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function readSessionFromCookieValue(token: string | null | undefined): AuthSession | null {
  const secret = getSigningSecret();
  if (!token || !secret) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AuthSession>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (typeof parsed.userId !== "number") {
      return null;
    }
    if (typeof parsed.identifier !== "string" || !parsed.identifier.trim()) {
      return null;
    }
    if (typeof parsed.name !== "string" || !parsed.name.trim()) {
      return null;
    }
    if (typeof parsed.issuedAt !== "string" || !parsed.issuedAt.trim()) {
      return null;
    }

    return {
      userId: parsed.userId,
      identifier: parsed.identifier,
      name: parsed.name,
      roleCodes: Array.isArray(parsed.roleCodes) ? parsed.roleCodes.filter((value): value is string => typeof value === "string") : [],
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions.filter((value): value is string => typeof value === "string") : [],
      bootstrapAccess: parsed.bootstrapAccess === true,
      issuedAt: parsed.issuedAt,
      preferredMode:
        parsed.preferredMode === "easy" || parsed.preferredMode === "advanced"
          ? parsed.preferredMode
          : undefined,
      preferredEasyRole:
        parsed.preferredEasyRole === "seller" || parsed.preferredEasyRole === "boss"
          ? parsed.preferredEasyRole
          : undefined,
    };
  } catch {
    return null;
  }
}

export function getSessionFromCookieStore(store: CookieStoreLike): AuthSession | null {
  return readSessionFromCookieValue(store.get(AUTH_COOKIE_NAME)?.value);
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  const store = await cookies();
  return getSessionFromCookieStore(store);
}

export async function resolveAccessProfile(identifier: string): Promise<ResolvedAccessProfile | null> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier) {
    return null;
  }

  const [users, userRoles, roles, rolePermissions, permissions] = await Promise.all([
    fetchApiList<UserRow>("/api/users"),
    fetchApiList<UserRoleRow>("/api/user-roles"),
    fetchApiList<RoleRow>("/api/roles"),
    fetchApiList<RolePermissionRow>("/api/role-permissions"),
    fetchApiList<PermissionRow>("/api/permissions"),
  ]);

  const user = users.find((entry) => {
    const email = entry.email?.trim().toLowerCase();
    const phone = entry.phone?.trim().toLowerCase();
    return (email && email === normalizedIdentifier) || (phone && phone === normalizedIdentifier);
  });

  if (!user || user.status !== "active") {
    return null;
  }

  const activeRoles = roles.filter((role) => role.is_active === undefined || role.is_active === null || role.is_active === true || role.is_active === 1);
  const activeRoleById = new Map(activeRoles.map((role) => [role.id, role]));
  const assignedRoles = userRoles
    .filter((entry) => entry.user_id === user.id)
    .map((entry) => activeRoleById.get(entry.role_id))
    .filter((role): role is RoleRow => Boolean(role));

  const roleCodes = normalizePermissionSet(
    assignedRoles.map((role) => (role.code?.trim() || role.name?.trim() || "").toLowerCase())
  );

  const permissionById = new Map(permissions.map((permission) => [permission.id, permission.code?.trim() || ""]));
  const explicitPermissionCodes = rolePermissions
    .filter((entry) => assignedRoles.some((role) => role.id === entry.role_id))
    .map((entry) => permissionById.get(entry.permission_id) ?? "")
    .map((code) => code.trim())
    .filter(Boolean);

  const presetPermissionCodes = roleCodes.flatMap((roleCode) => ROLE_PERMISSION_PRESETS[roleCode] ?? []);
  const resolvedPermissions = normalizePermissionSet(["dashboard.view", ...explicitPermissionCodes, ...presetPermissionCodes]);
  const derivedDefaults = deriveWorkspaceDefaults(resolvedPermissions);

  return {
    userId: user.id,
    identifier: user.email?.trim() || user.phone?.trim() || identifier.trim(),
    name: user.email?.trim() || user.phone?.trim() || identifier.trim(),
    roleCodes,
    permissions: resolvedPermissions,
    bootstrapAccess: false,
    preferredMode: derivedDefaults.preferredMode,
    preferredEasyRole: derivedDefaults.preferredEasyRole,
  };
}

export async function authenticateUser(identifier: string, password: string): Promise<Omit<AuthSession, "issuedAt"> | null> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier || !password) {
    return null;
  }

  const user = getConfiguredAuthUsers().find(
    (entry) => entry.identifier.trim().toLowerCase() === normalizedIdentifier && entry.password === password
  );

  if (!user) {
    return null;
  }

  const bootstrapRecoveryEnabled = user.bootstrapAdmin && isBootstrapAccessEnabled();
  const accessProfile = await resolveAccessProfile(user.identifier);
  if (!accessProfile) {
    if (bootstrapRecoveryEnabled) {
      return buildBootstrapAccessProfile(user);
    }
    return null;
  }

  const mergedPermissions = bootstrapRecoveryEnabled
    ? normalizePermissionSet([...accessProfile.permissions, ...BOOTSTRAP_ADMIN_PERMISSIONS])
    : accessProfile.permissions;
  const mergedDefaults = deriveWorkspaceDefaults(mergedPermissions);

  return {
    ...accessProfile,
    name: user.name?.trim() || accessProfile.name,
    permissions: mergedPermissions,
    bootstrapAccess: bootstrapRecoveryEnabled || accessProfile.bootstrapAccess,
    preferredMode: user.preferredMode ?? accessProfile.preferredMode ?? mergedDefaults.preferredMode,
    preferredEasyRole:
      user.preferredEasyRole ?? accessProfile.preferredEasyRole ?? mergedDefaults.preferredEasyRole,
  };
}
