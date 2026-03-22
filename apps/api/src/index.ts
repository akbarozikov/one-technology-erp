import { handleOptionsPreflight, withCors } from "./lib/cors";
import { routeRequest } from "./routes/router";
import type { Env } from "./types/env";

export type { Env };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const preflight = handleOptionsPreflight(request);
    if (preflight) return preflight;

    const response = await routeRequest(request, env);
    return withCors(request, response);
  },
};
