/**
 * Warehouse core: current stock state plus stock movement headers and ledger lines.
 * Balances are modeled at product + position granularity; movements are append-only history.
 */

export const TABLE_STOCK_BALANCES = "stock_balances" as const;
export const TABLE_STOCK_MOVEMENTS = "stock_movements" as const;
export const TABLE_STOCK_MOVEMENT_LINES = "stock_movement_lines" as const;

export type StockMovementType =
  | "purchase_receipt"
  | "issue"
  | "transfer"
  | "adjustment"
  | "writeoff"
  | "return"
  | "reservation_release"
  | "manual";

export type StockMovementStatus = "draft" | "confirmed" | "cancelled";

export interface StockBalanceRow {
  id: number;
  product_id: number;
  warehouse_id: number;
  position_id: number;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
  last_recalculated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovementRow {
  id: number;
  movement_type: StockMovementType;
  reference_code: string | null;
  warehouse_id: number | null;
  source_warehouse_id: number | null;
  destination_warehouse_id: number | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: StockMovementStatus;
  movement_date: string;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovementLineRow {
  id: number;
  stock_movement_id: number;
  product_id: number;
  from_position_id: number | null;
  to_position_id: number | null;
  quantity: number;
  unit_id: number;
  unit_cost: number | null;
  line_notes: string | null;
  created_at: string;
  updated_at: string;
}
