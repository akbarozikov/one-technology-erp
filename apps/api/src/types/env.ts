export interface Env {
  one_technology_erp_db: D1Database;
  ERP_CACHE: KVNamespace;
  one_technology_erp_files: R2Bucket;
  ERP_ACCESS_BOOTSTRAP_TOKEN?: string;
  ERP_ACCESS_BOOTSTRAP_ADMIN_IDENTIFIER?: string;
  ERP_AUTH_IDENTIFIER?: string;
}
