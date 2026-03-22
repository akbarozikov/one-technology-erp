-- Phase 2: product catalog (categories, UoM, suppliers, products, media, attributes, bundles).
-- Targets Cloudflare D1 (SQLite). Depends on Phase 1 tables only indirectly (none); standalone catalog.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Categories, units, suppliers
-- ---------------------------------------------------------------------------

CREATE TABLE product_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_category_id INTEGER REFERENCES product_categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE units_of_measure (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  symbol TEXT,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address_text TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES product_categories (id) ON DELETE SET NULL,
  default_unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  product_type TEXT NOT NULL CHECK (
    product_type IN (
      'simple',
      'configurable',
      'component',
      'assembled_system',
      'bundle',
      'service'
    )
  ),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  description TEXT,
  short_description TEXT,
  brand TEXT,
  minimum_sale_price REAL,
  is_stock_tracked INTEGER NOT NULL DEFAULT 1,
  is_sellable INTEGER NOT NULL DEFAULT 1,
  is_purchasable INTEGER NOT NULL DEFAULT 1,
  is_service INTEGER NOT NULL DEFAULT 0,
  has_variants INTEGER NOT NULL DEFAULT 0,
  has_attributes INTEGER NOT NULL DEFAULT 0,
  allow_manual_price INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (
    file_type IN ('manual', 'datasheet', 'drawing', 'certificate', 'other')
  ),
  file_url TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  data_type TEXT NOT NULL CHECK (
    data_type IN ('text', 'number', 'boolean', 'select', 'json')
  ),
  unit_hint TEXT,
  is_filterable INTEGER NOT NULL DEFAULT 0,
  is_required INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_attribute_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  attribute_id INTEGER NOT NULL REFERENCES product_attributes (id) ON DELETE CASCADE,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER,
  value_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, attribute_id)
);

CREATE TABLE product_suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
  supplier_sku TEXT,
  purchase_price REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  lead_time_days INTEGER,
  is_preferred INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, supplier_id)
);

CREATE TABLE product_bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_product_id INTEGER NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_bundle_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id INTEGER NOT NULL REFERENCES product_bundles (id) ON DELETE CASCADE,
  component_product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  quantity REAL NOT NULL DEFAULT 1,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_optional INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_product_categories_parent ON product_categories (parent_category_id);

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_default_unit ON products (default_unit_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_type ON products (product_type);

CREATE INDEX idx_product_images_product ON product_images (product_id);
CREATE INDEX idx_product_images_primary ON product_images (product_id, is_primary);

CREATE INDEX idx_product_files_product ON product_files (product_id);
CREATE INDEX idx_product_files_type ON product_files (file_type);

CREATE INDEX idx_product_attr_values_product ON product_attribute_values (product_id);
CREATE INDEX idx_product_attr_values_attribute ON product_attribute_values (attribute_id);

CREATE INDEX idx_product_suppliers_product ON product_suppliers (product_id);
CREATE INDEX idx_product_suppliers_supplier ON product_suppliers (supplier_id);

CREATE INDEX idx_product_bundles_bundle_product ON product_bundles (bundle_product_id);

CREATE INDEX idx_product_bundle_items_bundle ON product_bundle_items (bundle_id);
CREATE INDEX idx_product_bundle_items_component ON product_bundle_items (component_product_id);
CREATE INDEX idx_product_bundle_items_unit ON product_bundle_items (unit_id);
