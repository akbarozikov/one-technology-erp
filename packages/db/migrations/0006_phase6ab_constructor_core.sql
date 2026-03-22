-- Phase 6AB: constructor core foundation.
-- Targets Cloudflare D1 (SQLite). Stores configuration/variant state, calculation history, BOM data, and optional visuals.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Door configurations
-- ---------------------------------------------------------------------------

CREATE TABLE door_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  configuration_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  customer_id INTEGER,
  deal_id INTEGER,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'in_progress', 'ready', 'quoted', 'ordered', 'cancelled', 'archived')
  ),
  is_attached_to_quote INTEGER NOT NULL DEFAULT 0 CHECK (is_attached_to_quote IN (0, 1)),
  is_attached_to_order INTEGER NOT NULL DEFAULT 0 CHECK (is_attached_to_order IN (0, 1)),
  selected_variant_id INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE door_configuration_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  configuration_id INTEGER NOT NULL REFERENCES door_configurations (id) ON DELETE CASCADE,
  variant_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_current INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
  is_selected INTEGER NOT NULL DEFAULT 0 CHECK (is_selected IN (0, 1)),
  variant_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    variant_status IN ('draft', 'calculated', 'priced', 'quoted', 'accepted', 'cancelled')
  ),
  quote_line_id INTEGER,
  order_line_id INTEGER,
  minimum_sale_total REAL,
  actual_sale_total REAL,
  bom_total_cost REAL,
  bom_total_items INTEGER,
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (configuration_id, variant_number),
  CHECK (minimum_sale_total IS NULL OR minimum_sale_total >= 0),
  CHECK (actual_sale_total IS NULL OR actual_sale_total >= 0),
  CHECK (bom_total_cost IS NULL OR bom_total_cost >= 0),
  CHECK (bom_total_items IS NULL OR bom_total_items >= 0)
);

CREATE TABLE door_configuration_inputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES door_configuration_variants (id) ON DELETE CASCADE,
  input_key TEXT NOT NULL,
  input_label TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (
    input_type IN ('text', 'number', 'boolean', 'select', 'json')
  ),
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IS NULL OR value_boolean IN (0, 1)),
  value_json TEXT,
  unit_hint TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Calculation history
-- ---------------------------------------------------------------------------

CREATE TABLE calculation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES door_configuration_variants (id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (
    run_type IN ('full', 'spring_only', 'bom_only', 'pricing_only', 'validation_only')
  ),
  run_status TEXT NOT NULL DEFAULT 'success' CHECK (
    run_status IN ('success', 'warning', 'failed')
  ),
  input_snapshot_json TEXT,
  output_snapshot_json TEXT,
  warnings_json TEXT,
  errors_json TEXT,
  executed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  executed_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE spring_calculation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculation_run_id INTEGER NOT NULL REFERENCES calculation_runs (id) ON DELETE CASCADE,
  spring_system_type TEXT NOT NULL CHECK (
    spring_system_type IN ('torsion', 'extension', 'other')
  ),
  spring_count INTEGER,
  wire_size REAL,
  inner_diameter REAL,
  spring_length REAL,
  torque_value REAL,
  cycle_rating INTEGER,
  safety_factor REAL,
  result_status TEXT NOT NULL CHECK (
    result_status IN ('valid', 'warning', 'invalid')
  ),
  warning_text TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (spring_count IS NULL OR spring_count >= 0),
  CHECK (wire_size IS NULL OR wire_size >= 0),
  CHECK (inner_diameter IS NULL OR inner_diameter >= 0),
  CHECK (spring_length IS NULL OR spring_length >= 0),
  CHECK (cycle_rating IS NULL OR cycle_rating >= 0),
  CHECK (safety_factor IS NULL OR safety_factor >= 0)
);

-- ---------------------------------------------------------------------------
-- BOM lines and change history
-- ---------------------------------------------------------------------------

CREATE TABLE bom_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES door_configuration_variants (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  source_type TEXT NOT NULL CHECK (
    source_type IN ('rule_engine', 'spring_calculation', 'manual', 'bundle_logic', 'copied')
  ),
  source_reference TEXT,
  line_number INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES units_of_measure (id) ON DELETE RESTRICT,
  waste_factor REAL,
  unit_cost_snapshot REAL,
  unit_price_snapshot REAL,
  line_cost_total REAL,
  line_price_total REAL,
  snapshot_product_name TEXT NOT NULL,
  snapshot_sku TEXT NOT NULL,
  snapshot_unit_name TEXT NOT NULL,
  is_auto_generated INTEGER NOT NULL DEFAULT 0 CHECK (is_auto_generated IN (0, 1)),
  is_manually_edited INTEGER NOT NULL DEFAULT 0 CHECK (is_manually_edited IN (0, 1)),
  is_optional INTEGER NOT NULL DEFAULT 0 CHECK (is_optional IN (0, 1)),
  line_status TEXT NOT NULL DEFAULT 'active' CHECK (
    line_status IN ('active', 'removed', 'superseded')
  ),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (variant_id, line_number),
  CHECK (quantity > 0),
  CHECK (waste_factor IS NULL OR waste_factor >= 0),
  CHECK (unit_cost_snapshot IS NULL OR unit_cost_snapshot >= 0),
  CHECK (unit_price_snapshot IS NULL OR unit_price_snapshot >= 0),
  CHECK (line_cost_total IS NULL OR line_cost_total >= 0),
  CHECK (line_price_total IS NULL OR line_price_total >= 0)
);

CREATE TABLE bom_change_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES door_configuration_variants (id) ON DELETE CASCADE,
  bom_line_id INTEGER REFERENCES bom_lines (id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (
    change_type IN ('create', 'update', 'delete', 'manual_override', 'auto_regeneration')
  ),
  old_values_json TEXT,
  new_values_json TEXT,
  reason TEXT,
  changed_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Optional visuals
-- ---------------------------------------------------------------------------

CREATE TABLE configuration_visuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES door_configuration_variants (id) ON DELETE CASCADE,
  visual_type TEXT NOT NULL CHECK (
    visual_type IN ('2d_preview', 'schematic', 'image_render')
  ),
  file_url TEXT NOT NULL,
  preview_url TEXT,
  render_version TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_door_configurations_status ON door_configurations (status);
CREATE INDEX idx_door_configurations_customer ON door_configurations (customer_id);
CREATE INDEX idx_door_configurations_deal ON door_configurations (deal_id);
CREATE INDEX idx_door_configurations_created_by ON door_configurations (created_by_user_id);
CREATE INDEX idx_door_configurations_selected_variant ON door_configurations (selected_variant_id);
CREATE INDEX idx_door_configurations_created_at ON door_configurations (created_at);

CREATE INDEX idx_door_configuration_variants_configuration ON door_configuration_variants (configuration_id);
CREATE INDEX idx_door_configuration_variants_status ON door_configuration_variants (variant_status);
CREATE INDEX idx_door_configuration_variants_quote_line ON door_configuration_variants (quote_line_id);
CREATE INDEX idx_door_configuration_variants_order_line ON door_configuration_variants (order_line_id);
CREATE INDEX idx_door_configuration_variants_created_by ON door_configuration_variants (created_by_user_id);

CREATE INDEX idx_door_configuration_inputs_variant ON door_configuration_inputs (variant_id);
CREATE INDEX idx_door_configuration_inputs_variant_sort ON door_configuration_inputs (variant_id, sort_order, id);
CREATE INDEX idx_door_configuration_inputs_key ON door_configuration_inputs (input_key);

CREATE INDEX idx_calculation_runs_variant ON calculation_runs (variant_id);
CREATE INDEX idx_calculation_runs_type ON calculation_runs (run_type);
CREATE INDEX idx_calculation_runs_status ON calculation_runs (run_status);
CREATE INDEX idx_calculation_runs_executed_by ON calculation_runs (executed_by_user_id);
CREATE INDEX idx_calculation_runs_executed_at ON calculation_runs (executed_at);

CREATE INDEX idx_spring_calculation_results_run ON spring_calculation_results (calculation_run_id);
CREATE INDEX idx_spring_calculation_results_status ON spring_calculation_results (result_status);
CREATE INDEX idx_spring_calculation_results_type ON spring_calculation_results (spring_system_type);

CREATE INDEX idx_bom_lines_variant ON bom_lines (variant_id);
CREATE INDEX idx_bom_lines_variant_line ON bom_lines (variant_id, line_number, id);
CREATE INDEX idx_bom_lines_product ON bom_lines (product_id);
CREATE INDEX idx_bom_lines_unit ON bom_lines (unit_id);
CREATE INDEX idx_bom_lines_source_type ON bom_lines (source_type);
CREATE INDEX idx_bom_lines_status ON bom_lines (line_status);

CREATE INDEX idx_bom_change_logs_variant ON bom_change_logs (variant_id);
CREATE INDEX idx_bom_change_logs_bom_line ON bom_change_logs (bom_line_id);
CREATE INDEX idx_bom_change_logs_change_type ON bom_change_logs (change_type);
CREATE INDEX idx_bom_change_logs_changed_by ON bom_change_logs (changed_by_user_id);
CREATE INDEX idx_bom_change_logs_created_at ON bom_change_logs (created_at);

CREATE INDEX idx_configuration_visuals_variant ON configuration_visuals (variant_id);
CREATE INDEX idx_configuration_visuals_type ON configuration_visuals (visual_type);
