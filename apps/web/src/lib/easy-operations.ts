"use client";

export type SupplierRow = {
  id: number;
  name: string;
};

export type WarehouseRow = {
  id: number;
  name: string;
};

export type ProductRow = {
  id: number;
  name: string;
  sku?: string | null;
};

export type PurchaseReceiptRow = {
  id: number;
  receipt_number: string | null;
  supplier_id: number;
  destination_warehouse_id: number;
  receipt_date: string;
  status: string;
  source_document_number: string | null;
  currency: string | null;
  total_amount: number | null;
  notes: string | null;
  updated_at: string;
};

export type StockAdjustmentRow = {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  adjustment_date: string;
  reason: string | null;
  status: string;
  notes: string | null;
  updated_at: string;
};

export type StockAdjustmentLineRow = {
  id: number;
  stock_adjustment_id: number;
  product_id: number;
  difference_qty: number;
};

export type StockWriteoffRow = {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  writeoff_date: string;
  writeoff_reason: string | null;
  status: string;
  notes: string | null;
  updated_at: string;
};

export type StockWriteoffLineRow = {
  id: number;
  stock_writeoff_id: number;
  product_id: number;
  quantity: number;
};

export type InventoryCountRow = {
  id: number;
  reference_code: string | null;
  warehouse_id: number;
  count_date: string;
  status: string;
  notes: string | null;
  updated_at: string;
};

export type InventoryCountLineRow = {
  id: number;
  inventory_count_id: number;
  product_id: number;
  difference_qty: number;
};

export type ExpenseViewItem = {
  id: number;
  label: string;
  amount: number | null;
  category: string;
  relatedParty: string;
  date: string | null;
  updatedAt: string | null;
  status: string | null;
  attention: "Needs attention" | "Large expense" | "Recent" | "Routine";
  advancedHref: string;
  note: string | null;
};

export type InventoryAdjustmentViewItem = {
  id: string;
  label: string;
  quantityDelta: number | null;
  category: "Adjustment" | "Writeoff" | "Stock Count";
  reason: string | null;
  relatedItem: string;
  location: string;
  date: string | null;
  updatedAt: string | null;
  status: string | null;
  attention: "Needs review" | "Negative" | "Manual check" | "Routine";
  advancedHref: string;
  note: string | null;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isRecent(dateValue: string | null | undefined, days = 7): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const threshold = startOfDay(new Date());
  threshold.setDate(threshold.getDate() - days);
  return date >= threshold;
}

function topProductLabel(productIds: number[], productsById: Map<number, ProductRow>): string {
  if (productIds.length === 0) return "No item details yet";
  const first = productsById.get(productIds[0]);
  if (productIds.length === 1) {
    return first?.name || `Product ${productIds[0]}`;
  }
  return `${first?.name || `Product ${productIds[0]}`} +${productIds.length - 1} more`;
}

export function formatBossCurrency(
  value: number | null | undefined,
  currency = "USD"
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function expenseTone(attention: ExpenseViewItem["attention"]): string {
  if (attention === "Needs attention") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  }
  if (attention === "Large expense") {
    return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200";
  }
  if (attention === "Recent") {
    return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

export function inventoryAttentionTone(
  attention: InventoryAdjustmentViewItem["attention"]
): string {
  if (attention === "Needs review") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  }
  if (attention === "Negative") {
    return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200";
  }
  if (attention === "Manual check") {
    return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

export function buildExpenseItems(args: {
  purchaseReceipts: PurchaseReceiptRow[];
  suppliers: SupplierRow[];
  warehouses: WarehouseRow[];
}): ExpenseViewItem[] {
  const supplierById = new Map(args.suppliers.map((supplier) => [supplier.id, supplier]));
  const warehouseById = new Map(args.warehouses.map((warehouse) => [warehouse.id, warehouse]));

  return [...args.purchaseReceipts]
    .map((receipt) => {
      const amount = receipt.total_amount ?? null;
      const status = receipt.status?.toLowerCase() ?? "";
      let attention: ExpenseViewItem["attention"] = "Routine";

      if (status !== "confirmed") {
        attention = "Needs attention";
      } else if ((amount ?? 0) >= 1000) {
        attention = "Large expense";
      } else if (isRecent(receipt.receipt_date, 14)) {
        attention = "Recent";
      }

      return {
        id: receipt.id,
        label:
          receipt.receipt_number ||
          receipt.source_document_number ||
          `Receipt ${receipt.id}`,
        amount,
        category: "Supplier spend",
        relatedParty:
          supplierById.get(receipt.supplier_id)?.name || `Supplier ${receipt.supplier_id}`,
        date: receipt.receipt_date || null,
        updatedAt: receipt.updated_at || receipt.receipt_date || null,
        status: receipt.status || null,
        attention,
        advancedHref: "/admin/purchase-receipts",
        note:
          warehouseById.get(receipt.destination_warehouse_id)?.name
            ? `Into ${warehouseById.get(receipt.destination_warehouse_id)?.name}`
            : receipt.notes,
      } satisfies ExpenseViewItem;
    })
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
}

export function buildInventoryAdjustmentItems(args: {
  stockAdjustments: StockAdjustmentRow[];
  stockAdjustmentLines: StockAdjustmentLineRow[];
  stockWriteoffs: StockWriteoffRow[];
  stockWriteoffLines: StockWriteoffLineRow[];
  inventoryCounts: InventoryCountRow[];
  inventoryCountLines: InventoryCountLineRow[];
  products: ProductRow[];
  warehouses: WarehouseRow[];
}): InventoryAdjustmentViewItem[] {
  const productById = new Map(args.products.map((product) => [product.id, product]));
  const warehouseById = new Map(args.warehouses.map((warehouse) => [warehouse.id, warehouse]));
  const adjustmentLinesByHeader = new Map<number, StockAdjustmentLineRow[]>();
  const writeoffLinesByHeader = new Map<number, StockWriteoffLineRow[]>();
  const countLinesByHeader = new Map<number, InventoryCountLineRow[]>();

  for (const line of args.stockAdjustmentLines) {
    const list = adjustmentLinesByHeader.get(line.stock_adjustment_id) ?? [];
    list.push(line);
    adjustmentLinesByHeader.set(line.stock_adjustment_id, list);
  }
  for (const line of args.stockWriteoffLines) {
    const list = writeoffLinesByHeader.get(line.stock_writeoff_id) ?? [];
    list.push(line);
    writeoffLinesByHeader.set(line.stock_writeoff_id, list);
  }
  for (const line of args.inventoryCountLines) {
    const list = countLinesByHeader.get(line.inventory_count_id) ?? [];
    list.push(line);
    countLinesByHeader.set(line.inventory_count_id, list);
  }

  const adjustments = args.stockAdjustments.map((item) => {
    const lines = adjustmentLinesByHeader.get(item.id) ?? [];
    const quantityDelta = lines.reduce((sum, line) => sum + (line.difference_qty ?? 0), 0);
    const status = item.status?.toLowerCase() ?? "";
    const attention: InventoryAdjustmentViewItem["attention"] =
      status !== "confirmed"
        ? "Needs review"
        : quantityDelta < 0
          ? "Negative"
          : "Manual check";

    return {
      id: `adjustment-${item.id}`,
      label: item.reference_code || `Adjustment ${item.id}`,
      quantityDelta,
      category: "Adjustment",
      reason: item.reason || null,
      relatedItem: topProductLabel(
        lines.map((line) => line.product_id),
        productById
      ),
      location: warehouseById.get(item.warehouse_id)?.name || `Warehouse ${item.warehouse_id}`,
      date: item.adjustment_date || null,
      updatedAt: item.updated_at || item.adjustment_date || null,
      status: item.status || null,
      attention,
      advancedHref: "/admin/stock-adjustments",
      note: item.notes,
    } satisfies InventoryAdjustmentViewItem;
  });

  const writeoffs = args.stockWriteoffs.map((item) => {
    const lines = writeoffLinesByHeader.get(item.id) ?? [];
    const quantityDelta = -1 * lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
    const status = item.status?.toLowerCase() ?? "";
    const attention: InventoryAdjustmentViewItem["attention"] =
      status !== "confirmed" ? "Needs review" : "Negative";

    return {
      id: `writeoff-${item.id}`,
      label: item.reference_code || `Writeoff ${item.id}`,
      quantityDelta,
      category: "Writeoff",
      reason: item.writeoff_reason || null,
      relatedItem: topProductLabel(
        lines.map((line) => line.product_id),
        productById
      ),
      location: warehouseById.get(item.warehouse_id)?.name || `Warehouse ${item.warehouse_id}`,
      date: item.writeoff_date || null,
      updatedAt: item.updated_at || item.writeoff_date || null,
      status: item.status || null,
      attention,
      advancedHref: "/admin/stock-writeoffs",
      note: item.notes,
    } satisfies InventoryAdjustmentViewItem;
  });

  const counts = args.inventoryCounts.map((item) => {
    const lines = countLinesByHeader.get(item.id) ?? [];
    const quantityDelta = lines.reduce((sum, line) => sum + (line.difference_qty ?? 0), 0);
    const status = item.status?.toLowerCase() ?? "";
    const attention: InventoryAdjustmentViewItem["attention"] =
      status !== "completed" ? "Needs review" : "Manual check";

    return {
      id: `count-${item.id}`,
      label: item.reference_code || `Count ${item.id}`,
      quantityDelta,
      category: "Stock Count",
      reason: "Manual stock check",
      relatedItem: topProductLabel(
        lines.map((line) => line.product_id),
        productById
      ),
      location: warehouseById.get(item.warehouse_id)?.name || `Warehouse ${item.warehouse_id}`,
      date: item.count_date || null,
      updatedAt: item.updated_at || item.count_date || null,
      status: item.status || null,
      attention,
      advancedHref: "/admin/inventory-counts",
      note: item.notes,
    } satisfies InventoryAdjustmentViewItem;
  });

  return [...adjustments, ...writeoffs, ...counts].sort((a, b) =>
    String(b.date ?? "").localeCompare(String(a.date ?? ""))
  );
}
