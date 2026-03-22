-- Phase 3A: warehouse core foundation (stock balances + movement ledger).
-- Targets Cloudflare D1 (SQLite). Depends on Phase 1 sites and Phase 2 products/UoM.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Current stock state
-- ---------------------------------------------------------------------------

CREATE TABLE stock_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  on_hand_qty REAL NOT NULL DEFAULT 0,
  reserved_qty REAL NOT NULL DEFAULT 0,
  available_qty REAL NOT NULL DEFAULT 0,
  last_recalculated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, position_id),
  CHECK (on_hand_qty >= 0),
  CHECK (reserved_qty >= 0),
  CHECK (available_qty >= 0)
);

-- ---------------------------------------------------------------------------
-- Movement headers
-- ---------------------------------------------------------------------------

CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movement_type TEXT NOT NULL CHECK (
    movement_type IN (
      'purchase_receipt',
      'issue',
      'transfer',
      'adjustment',
      'writeoff',
      'return',
      'reservation_release',
      'manual'
    )
  ),
  reference_code TEXT,
  warehouse_id INTEGER REFERENCES warehouses (id) ON DELETE RESTRICT,
  source_warehouse_id INTEGER REFERENCES warehouses (id) ON DELETE RESTRICT,
  destination_warehouse_id INTEGER REFERENCES warehouses (id) ON DELETE RESTRICT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'confirmed', 'cancelled')
  ),
  movement_date TEXT NOT NULL DEFAULT (datetime('now')),
  performed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Movement lines (historical ledger)
-- ---------------------------------------------------------------------------

CREATE TABLE stock_movement_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_movement_id INTEGER NOT NULL REFERENCES stock_movements (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  from_position_id INTEGER REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  to_position_id INTEGER REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  unit_cost REAL,
  line_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_stock_balances_product ON stock_balances (product_id);
CREATE INDEX idx_stock_balances_warehouse ON stock_balances (warehouse_id);
CREATE INDEX idx_stock_balances_position ON stock_balances (position_id);
CREATE INDEX idx_stock_balances_warehouse_product ON stock_balances (warehouse_id, product_id);

CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_status ON stock_movements (status);
CREATE INDEX idx_stock_movements_date ON stock_movements (movement_date);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements (warehouse_id);
CREATE INDEX idx_stock_movements_source_warehouse ON stock_movements (source_warehouse_id);
CREATE INDEX idx_stock_movements_destination_warehouse ON stock_movements (destination_warehouse_id);
CREATE INDEX idx_stock_movements_related_entity ON stock_movements (related_entity_type, related_entity_id);
CREATE INDEX idx_stock_movements_performed_by ON stock_movements (performed_by_user_id);
CREATE INDEX idx_stock_movements_approved_by ON stock_movements (approved_by_user_id);

CREATE INDEX idx_stock_movement_lines_movement ON stock_movement_lines (stock_movement_id);
CREATE INDEX idx_stock_movement_lines_product ON stock_movement_lines (product_id);
CREATE INDEX idx_stock_movement_lines_from_position ON stock_movement_lines (from_position_id);
CREATE INDEX idx_stock_movement_lines_to_position ON stock_movement_lines (to_position_id);
CREATE INDEX idx_stock_movement_lines_unit ON stock_movement_lines (unit_id);
