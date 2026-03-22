import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import { requirePositiveInt } from "./helpers";

export interface RolePermissionCreateInput {
  role_id: number;
  permission_id: number;
}

export function parseRolePermissionCreate(
  body: JsonObject,
  errors: Failures
): RolePermissionCreateInput | null {
  const role_id = requirePositiveInt(body, "role_id", errors);
  const permission_id = requirePositiveInt(body, "permission_id", errors);

  if (role_id === null || permission_id === null || errors.length > 0) {
    return null;
  }

  return {
    role_id,
    permission_id,
  };
}
