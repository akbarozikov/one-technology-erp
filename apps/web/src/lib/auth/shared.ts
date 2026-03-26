export const AUTH_COOKIE_NAME = "ot_erp_session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthModePreference = "easy" | "advanced";
export type AuthEasyRolePreference = "seller" | "boss";

export type AuthSession = {
  userId: number;
  identifier: string;
  name: string;
  roleCodes: string[];
  permissions: string[];
  bootstrapAccess?: boolean;
  preferredMode?: AuthModePreference;
  preferredEasyRole?: AuthEasyRolePreference;
  issuedAt: string;
};

export type ConfiguredAuthUser = {
  identifier: string;
  password: string;
  name?: string;
  bootstrapAdmin?: boolean;
  preferredMode?: AuthModePreference;
  preferredEasyRole?: AuthEasyRolePreference;
};
