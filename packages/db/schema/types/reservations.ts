/**
 * Reservation domain: future-ready stock reservations connected to commercial and constructor line context.
 * Reservations are stored at product + warehouse position granularity and can later be released or consumed.
 */

export const TABLE_STOCK_RESERVATIONS = "stock_reservations" as const;

export type ReservationStatus =
  | "active"
  | "released"
  | "consumed"
  | "cancelled";

export interface StockReservationRow {
  id: number;
  product_id: number;
  warehouse_id: number;
  position_id: number;
  quote_line_id: number | null;
  order_line_id: number | null;
  configuration_variant_id: number | null;
  bom_line_id: number | null;
  reserved_qty: number;
  status: ReservationStatus;
  reserved_from: string | null;
  reserved_until: string | null;
  reservation_reason: string | null;
  created_by_user_id: number | null;
  released_by_user_id: number | null;
  release_reason: string | null;
  consumed_order_id: number | null;
  consumed_order_line_id: number | null;
  consumed_stock_movement_id: number | null;
  consumed_installation_job_id: number | null;
  consumed_at: string | null;
  created_at: string;
  updated_at: string;
}
