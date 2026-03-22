import { jsonOk, methodNotAllowed } from "../lib/response";

export function handleHealth(request: Request): Response {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }
  return jsonOk({
    ok: true,
    service: "one-technology-erp-api",
  });
}
