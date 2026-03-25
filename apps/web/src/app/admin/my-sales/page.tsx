"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import { EasySalesCard } from "@/components/admin/easy/EasySalesCard";
import { buildSales, type Sale, type SaleOrderLineRow, type SaleOrderRow, type SaleQuoteLineRow, type SaleQuoteRow, type SaleQuoteVersionRow } from "@/lib/easy-sales";

export default function MySalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
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
        const [ordersRes, orderLinesRes, quotesRes, versionsRes, quoteLinesRes] =
          await Promise.all([
            apiGet<{ data: SaleOrderRow[] }>("/api/orders"),
            apiGet<{ data: SaleOrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: SaleQuoteRow[] }>("/api/quotes"),
            apiGet<{ data: SaleQuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: SaleQuoteLineRow[] }>("/api/quote-lines"),
          ]);

        if (cancelled) return;

        const mappedSales = buildSales({
          quotes: quotesRes.data ?? [],
          quoteVersions: versionsRes.data ?? [],
          quoteLines: quoteLinesRes.data ?? [],
          orders: ordersRes.data ?? [],
          orderLines: orderLinesRes.data ?? [],
        }).filter((sale) => sale.status !== "Rejected");

        setSales(mappedSales);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load sales activity."
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

  const pendingSales = useMemo(
    () => sales.filter((sale) => sale.status === "Pending" || sale.status === "Needs changes"),
    [sales]
  );
  const approvedSales = useMemo(() => sales.filter((sale) => sale.status === "Approved"), [sales]);
  const needsChangesCount = useMemo(
    () => sales.filter((sale) => sale.status === "Needs changes").length,
    [sales]
  );

  return (
    <div className="max-w-6xl space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Easy Mode
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My Sales
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Track your sales in one place without switching between technical commercial screens.
        </p>
      </section>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> to
          load live sales data.
        </div>
      )}

      {loading && (
        <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Loading your sales view...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Active Sales
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {sales.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Sales currently in your workflow
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Pending
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {pendingSales.filter((sale) => sale.status === "Pending").length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Still waiting for a decision
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Needs Changes
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {needsChangesCount}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Sales that need another pass
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Quick Actions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/admin/new-sale"
                  className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  New Sale
                </Link>
                <Link
                  href="/admin/quote-versions"
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Advanced Sales
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Sales That Need You
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Keep the next customer conversations moving from one simple list.
                </p>
              </div>
              <Link
                href="/admin/new-sale"
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Start another sale
              </Link>
            </div>

            {pendingSales.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-200 px-4 py-4 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Nothing needs your attention right now.
                </p>
                <div className="mt-3">
                  <Link
                    href="/admin/new-sale"
                    className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Start a new sale
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {pendingSales.slice(0, 8).map((sale) => (
                  <EasySalesCard
                    key={sale.id}
                    sale={sale}
                    href={sale.advancedHref}
                    description="Open the advanced sales page only when you need the deeper commercial tools."
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Approved Sales
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Sales that already cleared the main decision step.
                </p>
              </div>
            </div>

            {approvedSales.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-200 px-4 py-4 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No approved sales are showing yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {approvedSales.slice(0, 6).map((sale) => (
                  <EasySalesCard
                    key={sale.id}
                    sale={sale}
                    href={sale.advancedHref}
                    description="Open the advanced sales page if you need the full follow-through workflow."
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
