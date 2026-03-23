-- Phase 8D: reservation consume context refinement.
-- Adds optional operational linkage for consumed reservations without introducing fulfillment automation.

PRAGMA foreign_keys = ON;

ALTER TABLE stock_reservations
  ADD COLUMN consumed_order_id INTEGER REFERENCES orders (id) ON DELETE SET NULL;

ALTER TABLE stock_reservations
  ADD COLUMN consumed_order_line_id INTEGER REFERENCES order_lines (id) ON DELETE SET NULL;

ALTER TABLE stock_reservations
  ADD COLUMN consumed_stock_movement_id INTEGER REFERENCES stock_movements (id) ON DELETE SET NULL;

ALTER TABLE stock_reservations
  ADD COLUMN consumed_installation_job_id INTEGER;

ALTER TABLE stock_reservations
  ADD COLUMN consumed_at TEXT;

CREATE INDEX idx_stock_reservations_consumed_order
  ON stock_reservations (consumed_order_id);

CREATE INDEX idx_stock_reservations_consumed_order_line
  ON stock_reservations (consumed_order_line_id);

CREATE INDEX idx_stock_reservations_consumed_stock_movement
  ON stock_reservations (consumed_stock_movement_id);

CREATE INDEX idx_stock_reservations_consumed_installation_job
  ON stock_reservations (consumed_installation_job_id);

CREATE INDEX idx_stock_reservations_consumed_at
  ON stock_reservations (consumed_at);
