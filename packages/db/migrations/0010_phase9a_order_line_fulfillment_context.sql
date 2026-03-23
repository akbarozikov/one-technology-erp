-- Phase 9A: order line fulfillment context refinement.
-- Adds small operational linkage fields so order lines can point at their primary fulfillment records.

PRAGMA foreign_keys = ON;

ALTER TABLE order_lines
  ADD COLUMN primary_reservation_id INTEGER REFERENCES stock_reservations (id) ON DELETE SET NULL;

ALTER TABLE order_lines
  ADD COLUMN primary_installation_job_id INTEGER REFERENCES installation_jobs (id) ON DELETE SET NULL;

ALTER TABLE order_lines
  ADD COLUMN primary_stock_movement_id INTEGER REFERENCES stock_movements (id) ON DELETE SET NULL;

ALTER TABLE order_lines
  ADD COLUMN fulfilled_at TEXT;

CREATE INDEX idx_order_lines_primary_reservation
  ON order_lines (primary_reservation_id);

CREATE INDEX idx_order_lines_primary_installation_job
  ON order_lines (primary_installation_job_id);

CREATE INDEX idx_order_lines_primary_stock_movement
  ON order_lines (primary_stock_movement_id);

CREATE INDEX idx_order_lines_fulfilled_at
  ON order_lines (fulfilled_at);
