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

export const PHASE4A_WAREHOUSE_OPERATIONAL_DOCUMENTS_MIGRATION =
  "0004_phase4a_warehouse_operational_documents.sql" as const;

export const PHASE5A_RESERVATIONS_MIGRATION =
  "0005_phase5a_reservations.sql" as const;

export const PHASE6AB_CONSTRUCTOR_CORE_MIGRATION =
  "0006_phase6ab_constructor_core.sql" as const;

export const PHASE7AB_COMMERCIAL_LAYER_MIGRATION =
  "0007_phase7ab_commercial_layer.sql" as const;
