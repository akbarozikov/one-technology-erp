"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import {
  buildExpenseItems,
  buildInventoryAdjustmentItems,
  expenseTone,
  formatBossCurrency,
  inventoryAttentionTone,
  type ExpenseViewItem,
  type InventoryAdjustmentViewItem,
  type InventoryCountLineRow,
  type InventoryCountRow,
  type ProductRow,
  type PurchaseReceiptRow,
  type StockAdjustmentLineRow,
  type StockAdjustmentRow,
  type StockWriteoffLineRow,
  type StockWriteoffRow,
  type SupplierRow,
  type WarehouseRow,
} from "@/lib/easy-operations";

function formatDelta(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  if (value > 0) return `+${value}`;
  return String(value);
}

function ExpenseCard({ item }: { item: ExpenseViewItem }) {
  return (
    <Link
      href={item.advancedHref}
      className="block rounded border border-zinc-200 bg-white p-4 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.relatedParty}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${expenseTone(item.attention)}`}
        >
          {item.attention}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Amount</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatBossCurrency(item.amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Type</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.category}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.date || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Status</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.status || "-"}</p>
        </div>
      </div>

      {item.note && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{item.note}</p>
      )}
    </Link>
  );
}

function InventoryCard({ item }: { item: InventoryAdjustmentViewItem }) {
  return (
    <Link
      href={item.advancedHref}
      className="block rounded border border-zinc-200 bg-white p-4 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {item.relatedItem} in {item.location}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${inventoryAttentionTone(item.attention)}`}
        >
          {item.attention}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Change</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatDelta(item.quantityDelta)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Type</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.category}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.date || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Status</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.status || "-"}</p>
        </div>
      </div>

      {(item.reason || item.note) && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {item.reason || item.note}
        </p>
      )}
    </Link>
  );
}

export function BossOperationsSurface() {
  const [expenses, setExpenses] = useState<ExpenseViewItem[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentViewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      try {
        const [
          purchaseReceiptsRes,
          stockAdjustmentsRes,
          stockAdjustmentLinesRes,
          stockWriteoffsRes,
          stockWriteoffLinesRes,
          inventoryCountsRes,
          inventoryCountLinesRes,
          suppliersRes,
          productsRes,
          warehousesRes,
        ] = await Promise.all([
          apiGet<{ data: PurchaseReceiptRow[] }>("/api/purchase-receipts"),
          apiGet<{ data: StockAdjustmentRow[] }>("/api/stock-adjustments"),
          apiGet<{ data: StockAdjustmentLineRow[] }>("/api/stock-adjustment-lines"),
          apiGet<{ data: StockWriteoffRow[] }>("/api/stock-writeoffs"),
          apiGet<{ data: StockWriteoffLineRow[] }>("/api/stock-writeoff-lines"),
          apiGet<{ data: InventoryCountRow[] }>("/api/inventory-counts"),
          apiGet<{ data: InventoryCountLineRow[] }>("/api/inventory-count-lines"),
          apiGet<{ data: SupplierRow[] }>("/api/suppliers"),
          apiGet<{ data: ProductRow[] }>("/api/products"),
          apiGet<{ data: WarehouseRow[] }>("/api/warehouses"),
        ]);

        if (cancelled) return;

        setExpenses(
          buildExpenseItems({
            purchaseReceipts: purchaseReceiptsRes.data ?? [],
            suppliers: suppliersRes.data ?? [],
            warehouses: warehousesRes.data ?? [],
          })
        );

        setAdjustments(
          buildInventoryAdjustmentItems({
            stockAdjustments: stockAdjustmentsRes.data ?? [],
            stockAdjustmentLines: stockAdjustmentLinesRes.data ?? [],
            stockWriteoffs: stockWriteoffsRes.data ?? [],
            stockWriteoffLines: stockWriteoffLinesRes.data ?? [],
            inventoryCounts: inventoryCountsRes.data ?? [],
            inventoryCountLines: inventoryCountLinesRes.data ?? [],
            products: productsRes.data ?? [],
            warehouses: warehousesRes.data ?? [],
          })
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load expenses and inventory adjustments."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);
  const largeExpenses = useMemo(
    () => expenses.filter((item) => item.attention === "Large expense" || item.attention === "Needs attention"),
    [expenses]
  );
  const attentionExpenses = useMemo(
    () => expenses.filter((item) => item.attention === "Needs attention"),
    [expenses]
  );
  const negativeAdjustments = useMemo(
    () => adjustments.filter((item) => (item.quantityDelta ?? 0) < 0),
    [adjustments]
  );
  const unusualAdjustments = useMemo(
    () => adjustments.filter(
      (item) => item.attention === "Needs review" || item.attention === "Manual check"
    ),
    [adjustments]
  );
  const needsReview = useMemo(
    () => adjustments.filter((item) => item.attention === "Needs review"),
    [adjustments]
  );
  const largeExpenseTotal = useMemo(
    () => largeExpenses.reduce((sum, item) => sum + (item.amount ?? 0), 0),
    [largeExpenses]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Expenses & Inventory Adjustments
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          A boss-facing view of spend and stock corrections, so unusual operational exceptions are
          easier to spot before they turn into bigger issues.
        </p>
      </div>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      {loading && (
        <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Loading operational exceptions...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Recent Expenses
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {recentExpenses.length}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Large Expenses
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatBossCurrency(largeExpenseTotal)}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Negative Adjustments
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {negativeAdjustments.length}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Needs Review
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {needsReview.length + attentionExpenses.length}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Manual Checks
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {unusualAdjustments.filter((item) => item.attention === "Manual check").length}
              </p>
            </div>
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/purchase-receipts"
                className="rounded border border-zinc-900 bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <div className="font-medium">Open purchase receipts</div>
                <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-700">
                  Review supplier spend in the advanced warehouse workflow.
                </p>
              </Link>
              <Link
                href="/admin/stock-adjustments"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Open stock adjustments</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Check manual stock corrections and their reasons.
                </p>
              </Link>
              <Link
                href="/admin/stock-writeoffs"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Open writeoffs</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Inspect damage, loss, defect, and other stock reductions.
                </p>
              </Link>
              <Link
                href="/admin"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Back to boss dashboard</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Return to the wider control surface.
                </p>
              </Link>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Large or Unconfirmed Expenses
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Supplier spend that is large enough, recent enough, or still unconfirmed to deserve a second look.
              </p>
              <div className="mt-4 space-y-3">
                {largeExpenses.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No supplier spend stands out right now.
                  </p>
                ) : (
                  largeExpenses.slice(0, 5).map((item) => <ExpenseCard key={item.id} item={item} />)
                )}
              </div>
            </section>

            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Recent Expenses
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Recent purchase receipts give a quick read on operational spend already entering the system.
              </p>
              <div className="mt-4 space-y-3">
                {recentExpenses.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No recent purchase receipts are visible yet.
                  </p>
                ) : (
                  recentExpenses.map((item) => <ExpenseCard key={item.id} item={item} />)
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Negative Adjustments
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Stock loss, writeoffs, and downward corrections that reduce what is available.
              </p>
              <div className="mt-4 space-y-3">
                {negativeAdjustments.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No negative stock changes stand out right now.
                  </p>
                ) : (
                  negativeAdjustments.slice(0, 6).map((item) => (
                    <InventoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </section>

            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Manual or Review-Needed Corrections
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manual counts, draft corrections, and other stock exceptions that deserve management awareness.
              </p>
              <div className="mt-4 space-y-3">
                {unusualAdjustments.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No manual or review-needed stock exceptions are visible right now.
                  </p>
                ) : (
                  unusualAdjustments.slice(0, 6).map((item) => (
                    <InventoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </section>
          </section>
        </>
      )}
    </div>
  );
}
