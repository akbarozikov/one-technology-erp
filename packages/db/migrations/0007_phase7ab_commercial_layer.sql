-- Phase 7AB: commercial layer foundation.
-- Targets Cloudflare D1 (SQLite). Stores quote, order, and payment history with snapshot fields.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Quotes
-- ---------------------------------------------------------------------------

CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'active', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')
  ),
  currency TEXT NOT NULL DEFAULT 'USD',
  minimum_sale_total REAL,
  actual_sale_total REAL,
  discount_total REAL,
  grand_total REAL,
  valid_until TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (minimum_sale_total IS NULL OR minimum_sale_total >= 0),
  CHECK (actual_sale_total IS NULL OR actual_sale_total >= 0),
  CHECK (discount_total IS NULL OR discount_total >= 0),
  CHECK (grand_total IS NULL OR grand_total >= 0)
);

CREATE TABLE quote_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes (id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    version_status IN ('draft', 'prepared', 'sent', 'accepted', 'rejected', 'superseded', 'cancelled')
  ),
  is_current INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
  based_on_version_id INTEGER REFERENCES quote_versions (id) ON DELETE SET NULL,
  minimum_sale_total REAL,
  actual_sale_total REAL,
  discount_total REAL,
  grand_total REAL,
  reservation_status TEXT NOT NULL DEFAULT 'none' CHECK (
    reservation_status IN ('none', 'partially_reserved', 'fully_reserved', 'released', 'consumed')
  ),
  notes TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (quote_id, version_number),
  CHECK (minimum_sale_total IS NULL OR minimum_sale_total >= 0),
  CHECK (actual_sale_total IS NULL OR actual_sale_total >= 0),
  CHECK (discount_total IS NULL OR discount_total >= 0),
  CHECK (grand_total IS NULL OR grand_total >= 0)
);

CREATE TABLE quote_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_version_id INTEGER NOT NULL REFERENCES quote_versions (id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  line_type TEXT NOT NULL CHECK (
    line_type IN ('product', 'bundle', 'configuration', 'service', 'custom')
  ),
  product_id INTEGER REFERENCES products (id) ON DELETE SET NULL,
  configuration_variant_id INTEGER,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  unit_price REAL,
  minimum_unit_price REAL,
  line_discount_type TEXT CHECK (
    line_discount_type IS NULL OR line_discount_type IN ('amount', 'percent')
  ),
  line_discount_value REAL,
  line_discount_total REAL,
  line_total REAL,
  snapshot_product_name TEXT NOT NULL,
  snapshot_sku TEXT NOT NULL,
  snapshot_unit_name TEXT NOT NULL,
  snapshot_description TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (quote_version_id, line_number),
  CHECK (quantity > 0),
  CHECK (unit_price IS NULL OR unit_price >= 0),
  CHECK (minimum_unit_price IS NULL OR minimum_unit_price >= 0),
  CHECK (line_discount_value IS NULL OR line_discount_value >= 0),
  CHECK (line_discount_total IS NULL OR line_discount_total >= 0),
  CHECK (line_total IS NULL OR line_total >= 0)
);

CREATE TABLE quote_discounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_version_id INTEGER NOT NULL REFERENCES quote_versions (id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (
    discount_type IN ('amount', 'percent')
  ),
  discount_value REAL NOT NULL,
  discount_total REAL,
  reason TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (discount_value >= 0),
  CHECK (discount_total IS NULL OR discount_total >= 0)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_version_id INTEGER REFERENCES quote_versions (id) ON DELETE SET NULL,
  customer_id INTEGER,
  deal_id INTEGER,
  order_number TEXT NOT NULL UNIQUE,
  installation_required INTEGER NOT NULL DEFAULT 0 CHECK (installation_required IN (0, 1)),
  fulfillment_type TEXT NOT NULL DEFAULT 'installation' CHECK (
    fulfillment_type IN ('installation', 'pickup', 'delivery_without_installation')
  ),
  order_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    order_status IN (
      'draft',
      'reserved',
      'awaiting_payment',
      'partially_paid',
      'ready_for_fulfillment',
      'scheduled_installation',
      'fulfilled',
      'completed',
      'cancelled'
    )
  ),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')
  ),
  reservation_status TEXT NOT NULL DEFAULT 'none' CHECK (
    reservation_status IN ('none', 'partially_reserved', 'fully_reserved', 'released', 'consumed')
  ),
  currency TEXT NOT NULL DEFAULT 'USD',
  minimum_sale_total REAL,
  actual_sale_total REAL,
  discount_total REAL,
  grand_total REAL,
  paid_total REAL,
  remaining_total REAL,
  order_date TEXT NOT NULL DEFAULT (datetime('now')),
  planned_installation_date TEXT,
  completed_at TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  approved_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (minimum_sale_total IS NULL OR minimum_sale_total >= 0),
  CHECK (actual_sale_total IS NULL OR actual_sale_total >= 0),
  CHECK (discount_total IS NULL OR discount_total >= 0),
  CHECK (grand_total IS NULL OR grand_total >= 0),
  CHECK (paid_total IS NULL OR paid_total >= 0),
  CHECK (remaining_total IS NULL OR remaining_total >= 0)
);

CREATE TABLE order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  line_type TEXT NOT NULL CHECK (
    line_type IN ('product', 'bundle', 'configuration', 'service', 'custom')
  ),
  product_id INTEGER REFERENCES products (id) ON DELETE SET NULL,
  configuration_variant_id INTEGER,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  unit_price REAL,
  minimum_unit_price REAL,
  line_discount_type TEXT CHECK (
    line_discount_type IS NULL OR line_discount_type IN ('amount', 'percent')
  ),
  line_discount_value REAL,
  line_discount_total REAL,
  line_total REAL,
  fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    fulfillment_status IN ('pending', 'reserved', 'issued', 'installed', 'cancelled')
  ),
  snapshot_product_name TEXT NOT NULL,
  snapshot_sku TEXT NOT NULL,
  snapshot_unit_name TEXT NOT NULL,
  snapshot_description TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (order_id, line_number),
  CHECK (quantity > 0),
  CHECK (unit_price IS NULL OR unit_price >= 0),
  CHECK (minimum_unit_price IS NULL OR minimum_unit_price >= 0),
  CHECK (line_discount_value IS NULL OR line_discount_value >= 0),
  CHECK (line_discount_total IS NULL OR line_discount_total >= 0),
  CHECK (line_total IS NULL OR line_total >= 0)
);

CREATE TABLE order_discounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (
    discount_type IN ('amount', 'percent')
  ),
  discount_value REAL NOT NULL,
  discount_total REAL,
  reason TEXT,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (discount_value >= 0),
  CHECK (discount_total IS NULL OR discount_total >= 0)
);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------

CREATE TABLE payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods (id) ON DELETE RESTRICT,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reference_number TEXT,
  received_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (
    status IN ('recorded', 'confirmed', 'cancelled')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (amount > 0)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_quotes_deal ON quotes (deal_id);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_quotes_valid_until ON quotes (valid_until);
CREATE INDEX idx_quotes_created_by ON quotes (created_by_user_id);
CREATE INDEX idx_quotes_approved_by ON quotes (approved_by_user_id);
CREATE INDEX idx_quotes_created_at ON quotes (created_at);

CREATE INDEX idx_quote_versions_quote ON quote_versions (quote_id);
CREATE INDEX idx_quote_versions_status ON quote_versions (version_status);
CREATE INDEX idx_quote_versions_reservation_status ON quote_versions (reservation_status);
CREATE INDEX idx_quote_versions_based_on ON quote_versions (based_on_version_id);
CREATE INDEX idx_quote_versions_created_by ON quote_versions (created_by_user_id);

CREATE INDEX idx_quote_lines_quote_version ON quote_lines (quote_version_id);
CREATE INDEX idx_quote_lines_product ON quote_lines (product_id);
CREATE INDEX idx_quote_lines_unit ON quote_lines (unit_id);
CREATE INDEX idx_quote_lines_configuration_variant ON quote_lines (configuration_variant_id);
CREATE INDEX idx_quote_lines_line_type ON quote_lines (line_type);

CREATE INDEX idx_quote_discounts_quote_version ON quote_discounts (quote_version_id);
CREATE INDEX idx_quote_discounts_created_by ON quote_discounts (created_by_user_id);
CREATE INDEX idx_quote_discounts_type ON quote_discounts (discount_type);

CREATE INDEX idx_orders_quote_version ON orders (quote_version_id);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_deal ON orders (deal_id);
CREATE INDEX idx_orders_order_status ON orders (order_status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_reservation_status ON orders (reservation_status);
CREATE INDEX idx_orders_fulfillment_type ON orders (fulfillment_type);
CREATE INDEX idx_orders_order_date ON orders (order_date);
CREATE INDEX idx_orders_created_by ON orders (created_by_user_id);
CREATE INDEX idx_orders_approved_by ON orders (approved_by_user_id);
CREATE INDEX idx_orders_created_at ON orders (created_at);

CREATE INDEX idx_order_lines_order ON order_lines (order_id);
CREATE INDEX idx_order_lines_product ON order_lines (product_id);
CREATE INDEX idx_order_lines_unit ON order_lines (unit_id);
CREATE INDEX idx_order_lines_configuration_variant ON order_lines (configuration_variant_id);
CREATE INDEX idx_order_lines_fulfillment_status ON order_lines (fulfillment_status);
CREATE INDEX idx_order_lines_line_type ON order_lines (line_type);

CREATE INDEX idx_order_discounts_order ON order_discounts (order_id);
CREATE INDEX idx_order_discounts_created_by ON order_discounts (created_by_user_id);
CREATE INDEX idx_order_discounts_type ON order_discounts (discount_type);

CREATE INDEX idx_payment_methods_active ON payment_methods (is_active);

CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_payments_payment_method ON payments (payment_method_id);
CREATE INDEX idx_payments_date ON payments (payment_date);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_received_by ON payments (received_by_user_id);
