/**
 * Warehouse operational documents: receipt, adjustment, writeoff, count, and transfer headers/lines.
 * These documents will later drive stock movement generation after confirmation workflows are added.
 */

export const TABLE_PURCHASE_RECEIPTS = "purchase_receipts" as const;
export const TABLE_PURCHASE_RECEIPT_LINES = "purchase_receipt_lines" as const;
export const TABLE_STOCK_ADJUSTMENTS = "stock_adjustments" as const;
export const TABLE_STOCK_ADJUSTMENT_LINES = "stock_adjustment_lines" as const;
export const TABLE_STOCK_WRITEOFFS = "stock_writeoffs" as const;
export const TABLE_STOCK_WRITEOFF_LINES = "stock_writeoff_lines" as const;
export const TABLE_INVENTORY_COUNTS = "inventory_counts" as const;
export const TABLE_INVENTORY_COUNT_LINES = "inventory_count_lines" as const;
export const TABLE_STOCK_TRANSFER_DOCUMENTS = "stock_transfer_documents" as const;
export const TABLE_STOCK_TRANSFER_LINES = "stock_transfer_lines" as const;

export type WarehouseDocumentStatus = "draft" | "confirmed" | "cancelled";

export type InventoryCountStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "cancelled";

export type WriteoffReason =
  | "damage"
  | "loss"
  | "defect"
  | "expired"
  | "other";

export interface PurchaseReceiptRow {
  id: number;
  receipt_number: string;
  supplier_id: number;
  destination_warehouse_id: number;
  receipt_date: string;
  status: WarehouseDocumentStatus;
  source_document_number: string | null;
  currency: string;
  total_amount: number | null;
  received_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseReceiptLineRow {
  id: number;
  purchase_receipt_id: number;
  line_number: number;
  product_id: number;
  destination_position_id: number | null;
  quantity: number;
  unit_id: number;
  unit_cost: number | null;
  line_total: number | null;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockAdjustmentRow {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  adjustment_date: string;
  reason: string;
  status: WarehouseDocumentStatus;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockAdjustmentLineRow {
  id: number;
  stock_adjustment_id: number;
  product_id: number;
  position_id: number;
  old_qty: number;
  new_qty: number;
  difference_qty: number;
  unit_id: number;
  line_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockWriteoffRow {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  writeoff_date: string;
  writeoff_reason: WriteoffReason;
  status: WarehouseDocumentStatus;
  performed_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockWriteoffLineRow {
  id: number;
  stock_writeoff_id: number;
  product_id: number;
  position_id: number;
  quantity: number;
  unit_id: number;
  line_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryCountRow {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  count_date: string;
  status: InventoryCountStatus;
  performed_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryCountLineRow {
  id: number;
  inventory_count_id: number;
  product_id: number;
  position_id: number;
  system_qty: number;
  counted_qty: number;
  difference_qty: number;
  unit_id: number;
  line_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransferDocumentRow {
  id: number;
  reference_code: string | null;
  source_warehouse_id: number;
  destination_warehouse_id: number;
  transfer_date: string;
  status: WarehouseDocumentStatus;
  requested_by_user_id: number | null;
  confirmed_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransferLineRow {
  id: number;
  stock_transfer_document_id: number;
  product_id: number;
  from_position_id: number | null;
  to_position_id: number | null;
  quantity: number;
  unit_id: number;
  line_notes: string | null;
  created_at: string;
  updated_at: string;
}
