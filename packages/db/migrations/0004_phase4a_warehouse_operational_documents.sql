-- Phase 4A: warehouse operational documents foundation.
-- Targets Cloudflare D1 (SQLite). Documents will later generate stock movements.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Purchase receipts
-- ---------------------------------------------------------------------------

CREATE TABLE purchase_receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_number TEXT NOT NULL UNIQUE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers (id) ON DELETE RESTRICT,
  destination_warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  receipt_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'confirmed', 'cancelled')
  ),
  source_document_number TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount REAL,
  received_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (total_amount IS NULL OR total_amount >= 0)
);

CREATE TABLE purchase_receipt_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_receipt_id INTEGER NOT NULL REFERENCES purchase_receipts (id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  destination_position_id INTEGER REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  unit_cost REAL,
  line_total REAL,
  snapshot_product_name TEXT NOT NULL,
  snapshot_sku TEXT NOT NULL,
  snapshot_unit_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (purchase_receipt_id, line_number),
  CHECK (quantity > 0),
  CHECK (unit_cost IS NULL OR unit_cost >= 0),
  CHECK (line_total IS NULL OR line_total >= 0)
);

-- ---------------------------------------------------------------------------
-- Stock adjustments
-- ---------------------------------------------------------------------------

CREATE TABLE stock_adjustments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  adjustment_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'confirmed', 'cancelled')
  ),
  performed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stock_adjustment_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_adjustment_id INTEGER NOT NULL REFERENCES stock_adjustments (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  old_qty REAL NOT NULL,
  new_qty REAL NOT NULL,
  difference_qty REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  line_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (old_qty >= 0),
  CHECK (new_qty >= 0)
);

-- ---------------------------------------------------------------------------
-- Stock writeoffs
-- ---------------------------------------------------------------------------

CREATE TABLE stock_writeoffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  writeoff_date TEXT NOT NULL,
  writeoff_reason TEXT NOT NULL CHECK (
    writeoff_reason IN ('damage', 'loss', 'defect', 'expired', 'other')
  ),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'confirmed', 'cancelled')
  ),
  performed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stock_writeoff_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_writeoff_id INTEGER NOT NULL REFERENCES stock_writeoffs (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  line_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- Inventory counts
-- ---------------------------------------------------------------------------

CREATE TABLE inventory_counts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  count_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'in_progress', 'completed', 'cancelled')
  ),
  performed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE inventory_count_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inventory_count_id INTEGER NOT NULL REFERENCES inventory_counts (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  system_qty REAL NOT NULL,
  counted_qty REAL NOT NULL,
  difference_qty REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  line_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (system_qty >= 0),
  CHECK (counted_qty >= 0)
);

-- ---------------------------------------------------------------------------
-- Stock transfer documents
-- ---------------------------------------------------------------------------

CREATE TABLE stock_transfer_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT,
  source_warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  destination_warehouse_id INTEGER NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
  transfer_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'confirmed', 'cancelled')
  ),
  requested_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  confirmed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stock_transfer_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_transfer_document_id INTEGER NOT NULL REFERENCES stock_transfer_documents (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  from_position_id INTEGER REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  to_position_id INTEGER REFERENCES warehouse_positions (id) ON DELETE RESTRICT,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  line_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_purchase_receipts_supplier ON purchase_receipts (supplier_id);
CREATE INDEX idx_purchase_receipts_destination_warehouse ON purchase_receipts (destination_warehouse_id);
CREATE INDEX idx_purchase_receipts_date ON purchase_receipts (receipt_date);
CREATE INDEX idx_purchase_receipts_status ON purchase_receipts (status);
CREATE INDEX idx_purchase_receipts_received_by ON purchase_receipts (received_by_user_id);
CREATE INDEX idx_purchase_receipts_approved_by ON purchase_receipts (approved_by_user_id);

CREATE INDEX idx_purchase_receipt_lines_receipt ON purchase_receipt_lines (purchase_receipt_id);
CREATE INDEX idx_purchase_receipt_lines_product ON purchase_receipt_lines (product_id);
CREATE INDEX idx_purchase_receipt_lines_position ON purchase_receipt_lines (destination_position_id);
CREATE INDEX idx_purchase_receipt_lines_unit ON purchase_receipt_lines (unit_id);

CREATE INDEX idx_stock_adjustments_warehouse ON stock_adjustments (warehouse_id);
CREATE INDEX idx_stock_adjustments_date ON stock_adjustments (adjustment_date);
CREATE INDEX idx_stock_adjustments_status ON stock_adjustments (status);
CREATE INDEX idx_stock_adjustments_performed_by ON stock_adjustments (performed_by_user_id);
CREATE INDEX idx_stock_adjustments_approved_by ON stock_adjustments (approved_by_user_id);

CREATE INDEX idx_stock_adjustment_lines_adjustment ON stock_adjustment_lines (stock_adjustment_id);
CREATE INDEX idx_stock_adjustment_lines_product ON stock_adjustment_lines (product_id);
CREATE INDEX idx_stock_adjustment_lines_position ON stock_adjustment_lines (position_id);
CREATE INDEX idx_stock_adjustment_lines_unit ON stock_adjustment_lines (unit_id);

CREATE INDEX idx_stock_writeoffs_warehouse ON stock_writeoffs (warehouse_id);
CREATE INDEX idx_stock_writeoffs_date ON stock_writeoffs (writeoff_date);
CREATE INDEX idx_stock_writeoffs_status ON stock_writeoffs (status);
CREATE INDEX idx_stock_writeoffs_reason ON stock_writeoffs (writeoff_reason);
CREATE INDEX idx_stock_writeoffs_performed_by ON stock_writeoffs (performed_by_user_id);
CREATE INDEX idx_stock_writeoffs_approved_by ON stock_writeoffs (approved_by_user_id);

CREATE INDEX idx_stock_writeoff_lines_writeoff ON stock_writeoff_lines (stock_writeoff_id);
CREATE INDEX idx_stock_writeoff_lines_product ON stock_writeoff_lines (product_id);
CREATE INDEX idx_stock_writeoff_lines_position ON stock_writeoff_lines (position_id);
CREATE INDEX idx_stock_writeoff_lines_unit ON stock_writeoff_lines (unit_id);

CREATE INDEX idx_inventory_counts_warehouse ON inventory_counts (warehouse_id);
CREATE INDEX idx_inventory_counts_date ON inventory_counts (count_date);
CREATE INDEX idx_inventory_counts_status ON inventory_counts (status);
CREATE INDEX idx_inventory_counts_performed_by ON inventory_counts (performed_by_user_id);

CREATE INDEX idx_inventory_count_lines_count ON inventory_count_lines (inventory_count_id);
CREATE INDEX idx_inventory_count_lines_product ON inventory_count_lines (product_id);
CREATE INDEX idx_inventory_count_lines_position ON inventory_count_lines (position_id);
CREATE INDEX idx_inventory_count_lines_unit ON inventory_count_lines (unit_id);

CREATE INDEX idx_stock_transfer_documents_source_warehouse ON stock_transfer_documents (source_warehouse_id);
CREATE INDEX idx_stock_transfer_documents_destination_warehouse ON stock_transfer_documents (destination_warehouse_id);
CREATE INDEX idx_stock_transfer_documents_date ON stock_transfer_documents (transfer_date);
CREATE INDEX idx_stock_transfer_documents_status ON stock_transfer_documents (status);
CREATE INDEX idx_stock_transfer_documents_requested_by ON stock_transfer_documents (requested_by_user_id);
CREATE INDEX idx_stock_transfer_documents_confirmed_by ON stock_transfer_documents (confirmed_by_user_id);

CREATE INDEX idx_stock_transfer_lines_document ON stock_transfer_lines (stock_transfer_document_id);
CREATE INDEX idx_stock_transfer_lines_product ON stock_transfer_lines (product_id);
CREATE INDEX idx_stock_transfer_lines_from_position ON stock_transfer_lines (from_position_id);
CREATE INDEX idx_stock_transfer_lines_to_position ON stock_transfer_lines (to_position_id);
CREATE INDEX idx_stock_transfer_lines_unit ON stock_transfer_lines (unit_id);
