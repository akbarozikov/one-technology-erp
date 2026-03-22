import { badRequest, serverError } from "./response";

/** Map common D1/SQLite failures to HTTP responses; rethrow unknown errors. */
export function mapSqliteError(err: unknown): Response | null {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("UNIQUE constraint failed")) {
    return badRequest("Unique constraint violation", { sqliteMessage: msg });
  }
  if (msg.includes("FOREIGN KEY constraint failed")) {
    return badRequest("Foreign key constraint violation", { sqliteMessage: msg });
  }
  if (msg.includes("CHECK constraint failed")) {
    return badRequest("Check constraint violation", { sqliteMessage: msg });
  }
  return null;
}

export function asSqlFailure(err: unknown): Response {
  const mapped = mapSqliteError(err);
  if (mapped) return mapped;
  console.error(err);
  return serverError();
}
