/**
 * Local-dev CORS for browser clients (Next.js on :3000 → Worker on :8787).
 */

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function headersForOrigin(origin: string | null): Record<string, string> | null {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin",
  };
}

/** Merge CORS headers onto an existing response when Origin is allowed. */
export function withCors(request: Request, response: Response): Response {
  const extra = headersForOrigin(request.headers.get("Origin"));
  if (!extra) return response;

  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(extra)) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Respond to browser preflight; return null if not an OPTIONS request. */
export function handleOptionsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  const h = headersForOrigin(request.headers.get("Origin"));
  return new Response(null, {
    status: 204,
    headers: h ? new Headers(h) : undefined,
  });
}
