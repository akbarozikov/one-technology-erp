import { notFound } from "../lib/response";
import type { Env } from "../types/env";
import { handleDebugBindings } from "./debug";
import { handleBranches } from "./branches";
import { handleDepartments } from "./departments";
import { handleEmployees } from "./employees";
import { handleHealth } from "./health";
import { handleLocations } from "./locations";
import { handlePermissions } from "./permissions";
import { handleRoles } from "./roles";
import { handleUsers } from "./users";
import { handleWarehousePositions } from "./warehouse-positions";
import { handleWarehouses } from "./warehouses";

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  switch (path) {
    case "/":
      return new Response("One Technology ERP API is running.", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    case "/health":
      return handleHealth(request);
    case "/debug/bindings":
      return handleDebugBindings(request, env);
    case "/api/roles":
      return handleRoles(request, env);
    case "/api/permissions":
      return handlePermissions(request, env);
    case "/api/users":
      return handleUsers(request, env);
    case "/api/departments":
      return handleDepartments(request, env);
    case "/api/employees":
      return handleEmployees(request, env);
    case "/api/branches":
      return handleBranches(request, env);
    case "/api/locations":
      return handleLocations(request, env);
    case "/api/warehouses":
      return handleWarehouses(request, env);
    case "/api/warehouse-positions":
      return handleWarehousePositions(request, env);
    default:
      return notFound();
  }
}
