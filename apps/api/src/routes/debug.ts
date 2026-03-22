import { jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";

export function handleDebugBindings(request: Request, env: Env): Response {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }
  return jsonOk({
    hasD1: !!env.one_technology_erp_db,
    hasKV: !!env.ERP_CACHE,
    hasR2: !!env.one_technology_erp_files,
  });
}
