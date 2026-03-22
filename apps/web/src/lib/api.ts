/**
 * Minimal JSON client for the Cloudflare Worker API.
 * Set NEXT_PUBLIC_API_BASE_URL (e.g. http://127.0.0.1:8787) in .env.local
 */

/** Returns null if unset — show a config hint in the UI instead of throwing at import time. */
export function getApiBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) return null;
  return base.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function parseErrorMessage(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof (payload.error as { message: unknown }).message === "string"
  ) {
    return (payload.error as { message: string }).message;
  }
  return "Request failed";
}

/** Full message for UI when the API returns `{ error: { message, details? } }`. */
export function formatApiError(err: ApiError): string {
  const msg = err.message;
  if (!err.body || typeof err.body !== "object") return msg;
  const payload = err.body as Record<string, unknown>;
  const errObj = payload.error;
  if (!errObj || typeof errObj !== "object") return msg;
  const details = (errObj as { details?: unknown }).details;
  if (details === undefined) return msg;
  if (
    typeof details === "object" &&
    details !== null &&
    "sqliteMessage" in details &&
    typeof (details as { sqliteMessage?: unknown }).sqliteMessage === "string"
  ) {
    return `${msg}\n${(details as { sqliteMessage: string }).sqliteMessage}`;
  }
  const extra =
    typeof details === "string" ? details : JSON.stringify(details);
  return `${msg}\n${extra}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to apps/web/.env.local",
      0
    );
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError("Invalid JSON response", res.status, text);
  }
  if (!res.ok) {
    throw new ApiError(parseErrorMessage(json), res.status, json);
  }
  return json as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to apps/web/.env.local",
      0
    );
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError("Invalid JSON response", res.status, text);
  }
  if (!res.ok) {
    throw new ApiError(parseErrorMessage(json), res.status, json);
  }
  return json as T;
}
