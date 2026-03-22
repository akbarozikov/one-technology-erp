/**
 * @one-technology/db — D1 schema types, table identifiers, and migration SQL layout for One Technology ERP.
 */
export * from "./schema";

/** Relative to this package root; use with tooling or docs that need the migrations path string. */
export const MIGRATIONS_DIR = "migrations" as const;

export const INITIAL_PHASE1_MIGRATION = "0001_phase1_foundation.sql" as const;
