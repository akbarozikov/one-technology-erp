import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import { requirePositiveInt } from "./helpers";

export interface UserRoleCreateInput {
  user_id: number;
  role_id: number;
}

export function parseUserRoleCreate(
  body: JsonObject,
  errors: Failures
): UserRoleCreateInput | null {
  const user_id = requirePositiveInt(body, "user_id", errors);
  const role_id = requirePositiveInt(body, "role_id", errors);

  if (user_id === null || role_id === null || errors.length > 0) {
    return null;
  }

  return {
    user_id,
    role_id,
  };
}
