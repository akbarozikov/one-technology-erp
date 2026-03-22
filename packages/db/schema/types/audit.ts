/**
 * Append-only style audit trail for sensitive actions.
 * user_id / employee_id optional when the actor is unknown or system-only.
 */

export const TABLE_AUDIT_LOGS = "audit_logs" as const;

export interface AuditLogRow {
  id: number;
  user_id: number | null;
  employee_id: number | null;
  action: string;
  module: string | null;
  entity_type: string | null;
  /** Stable string id for the affected row (numeric or textual per entity). */
  entity_id: string | null;
  old_values_json: string | null;
  new_values_json: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
