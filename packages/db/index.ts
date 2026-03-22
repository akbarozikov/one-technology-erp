/**
 * @one-technology/db — D1 schema types, table identifiers, and migration SQL layout for One Technology ERP.
 */
export * from "./schema";

/** Relative to this package root; use with tooling or docs that need the migrations path string. */
export const MIGRATIONS_DIR = "migrations" as const;

export const INITIAL_PHASE1_MIGRATION = "0001_phase1_foundation.sql" as const;

export const PHASE2_PRODUCT_CATALOG_MIGRATION =
  "0002_phase2_product_catalog.sql" as const;

export const PHASE3A_WAREHOUSE_CORE_MIGRATION =
  "0003_phase3a_warehouse_core.sql" as const;
