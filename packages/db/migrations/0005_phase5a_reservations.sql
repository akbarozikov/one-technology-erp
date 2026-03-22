-- Phase 5A: reservation domain foundation.
-- Targets Cloudflare D1 (SQLite). Reservations will later connect commercial and constructor flows to warehouse stock.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Stock reservations
-- ---------------------------------------------------------------------------

CREATE TABLE stock_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  quote_line_id INTEGER,
  order_line_id INTEGER,
  configuration_variant_id INTEGER,
  bom_line_id INTEGER,
  reserved_qty REAL NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('active', 'released', 'consumed', 'cancelled')
  ),
  reserved_from TEXT,
  reserved_until TEXT,
  reservation_reason TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  released_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  release_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (reserved_qty > 0)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_stock_reservations_product ON stock_reservations (product_id);
CREATE INDEX idx_stock_reservations_warehouse ON stock_reservations (warehouse_id);
CREATE INDEX idx_stock_reservations_position ON stock_reservations (position_id);
CREATE INDEX idx_stock_reservations_status ON stock_reservations (status);
CREATE INDEX idx_stock_reservations_quote_line ON stock_reservations (quote_line_id);
CREATE INDEX idx_stock_reservations_order_line ON stock_reservations (order_line_id);
CREATE INDEX idx_stock_reservations_configuration_variant ON stock_reservations (configuration_variant_id);
CREATE INDEX idx_stock_reservations_bom_line ON stock_reservations (bom_line_id);
CREATE INDEX idx_stock_reservations_created_by ON stock_reservations (created_by_user_id);
CREATE INDEX idx_stock_reservations_released_by ON stock_reservations (released_by_user_id);
