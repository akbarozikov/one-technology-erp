import { asSqlFailure } from "../lib/d1-errors";
import {
  ensureAccessBaseline,
  getBootstrapToken,
} from "../lib/access-bootstrap";
import { readJsonObject } from "../lib/json";
import { badRequest, jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";

export async function handleAccessBootstrapSeed(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const configuredToken = getBootstrapToken(env);
  if (!configuredToken) {
    return badRequest(
      "Bootstrap seed is disabled. Set ERP_ACCESS_BOOTSTRAP_TOKEN in the API environment to enable it."
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const providedToken =
    request.headers.get("x-bootstrap-token")?.trim() ||
    (typeof body.token === "string" ? body.token.trim() : "");

  if (!providedToken || providedToken !== configuredToken) {
    return badRequest("Invalid bootstrap token");
  }

  const adminIdentifier =
    typeof body.admin_identifier === "string" ? body.admin_identifier.trim() : undefined;

  try {
    const data = await ensureAccessBaseline(env, { adminIdentifier });
    return jsonOk({
      data,
      meta: {
        bootstrap_seeded: true,
        note:
          "The core permission catalog and baseline roles are now seeded automatically. After verifying DB-backed admin access works, you can disable bootstrap recovery.",
      },
    });
  } catch (err) {
    return asSqlFailure(err);
  }
}
