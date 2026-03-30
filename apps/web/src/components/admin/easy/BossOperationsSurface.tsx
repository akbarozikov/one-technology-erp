"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import { useI18n } from "@/components/admin/LanguageProvider";
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
  const { adminText } = useI18n();
  return (
    <Link
      href={item.advancedHref}
      className="app-panel block p-4 transition duration-150 hover:-translate-y-0.5 hover:border-black/15 dark:hover:border-white/12"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.relatedParty}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${expenseTone(item.attention)}`}
        >
          {adminText(item.attention)}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Amount")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatBossCurrency(item.amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Type")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{adminText(item.category)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Date")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.date || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Status")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.status ? adminText(item.status) : "-"}</p>
        </div>
      </div>

      {item.note && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{item.note}</p>
      )}
    </Link>
  );
}

function InventoryCard({ item }: { item: InventoryAdjustmentViewItem }) {
  const { adminText } = useI18n();
  return (
    <Link
      href={item.advancedHref}
      className="app-panel block p-4 transition duration-150 hover:-translate-y-0.5 hover:border-black/15 dark:hover:border-white/12"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {item.relatedItem} {adminText("in")} {item.location}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${inventoryAttentionTone(item.attention)}`}
        >
          {adminText(item.attention)}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Change")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatDelta(item.quantityDelta)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Type")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{adminText(item.category)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Date")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.date || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{adminText("Status")}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{item.status ? adminText(item.status) : "-"}</p>
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
  const { hasAnyPermission } = useAuth();
  const { adminText } = useI18n();
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
              : adminText("Failed to load expenses and inventory adjustments.")
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
  const canViewCatalog = hasAnyPermission(["products.manage"]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="app-page-title text-[2rem]">
          {adminText("Expenses & Inventory Adjustments")}
        </h1>
        <p className="app-page-subtitle">
          {adminText("A boss-facing view of spend and stock corrections, so unusual operational exceptions are easier to spot before they turn into bigger issues.")}
        </p>
      </div>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {adminText("Set")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          {adminText("in")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      {loading && (
        <section className="app-stat">
          <p className="text-sm text-zinc-500">{adminText("Loading operational exceptions...")}</p>
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
            <div className="app-stat">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Recent Expenses")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {recentExpenses.length}
              </p>
            </div>
            <div className="app-stat">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Large Expenses")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatBossCurrency(largeExpenseTotal)}
              </p>
            </div>
            <div className="app-stat">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Negative Adjustments")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {negativeAdjustments.length}
              </p>
            </div>
            <div className="app-stat">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Needs Review")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {needsReview.length + attentionExpenses.length}
              </p>
            </div>
            <div className="app-stat">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Manual Checks")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {unusualAdjustments.filter((item) => item.attention === "Manual check").length}
              </p>
            </div>
          </section>

          <section className="app-panel p-5 lg:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{adminText("Quick Actions")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/purchase-receipts"
                className="app-button-primary min-h-24 flex-col items-start !rounded-[1.2rem] !px-4 !py-4 text-left"
              >
                <div className="font-medium">{adminText("Open purchase receipts")}</div>
                <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-700">
                  {adminText("Review supplier spend in the advanced warehouse workflow.")}
                </p>
              </Link>
              <Link
                href="/admin/stock-adjustments"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Open stock adjustments")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Check manual stock corrections and their reasons.")}
                </p>
              </Link>
              <Link
                href="/admin/stock-writeoffs"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Open writeoffs")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Inspect damage, loss, defect, and other stock reductions.")}
                </p>
              </Link>
              {canViewCatalog && <Link
                href="/admin/products"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Open products")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Cross-check the affected catalog items behind these operational exceptions.")}
                </p>
              </Link>}
              <Link
                href="/admin"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Back to boss dashboard")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Return to the wider control surface.")}
                </p>
              </Link>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Large or Unconfirmed Expenses")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("Supplier spend that is large enough, recent enough, or still unconfirmed to deserve a second look.")}
              </p>
              <div className="mt-4 space-y-3">
                {largeExpenses.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No supplier spend stands out right now.")}
                  </p>
                ) : (
                  largeExpenses.slice(0, 5).map((item) => <ExpenseCard key={item.id} item={item} />)
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Recent Expenses")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("Recent purchase receipts give a quick read on operational spend already entering the system.")}
              </p>
              <div className="mt-4 space-y-3">
                {recentExpenses.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No recent purchase receipts are visible yet.")}
                  </p>
                ) : (
                  recentExpenses.map((item) => <ExpenseCard key={item.id} item={item} />)
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Negative Adjustments")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("Stock loss, writeoffs, and downward corrections that reduce what is available.")}
              </p>
              <div className="mt-4 space-y-3">
                {negativeAdjustments.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No negative stock changes stand out right now.")}
                  </p>
                ) : (
                  negativeAdjustments.slice(0, 6).map((item) => (
                    <InventoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Manual or Review-Needed Corrections")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("Manual counts, draft corrections, and other stock exceptions that deserve management awareness.")}
              </p>
              <div className="mt-4 space-y-3">
                {unusualAdjustments.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No manual or review-needed stock exceptions are visible right now.")}
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

