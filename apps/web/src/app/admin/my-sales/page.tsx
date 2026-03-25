"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import { EasySalesCard } from "@/components/admin/easy/EasySalesCard";

type OrderRow = {
  id: number;
  quote_version_id: number | null;
  order_number: string;
  order_status: string;
  payment_status: string;
  grand_total: number | null;
  order_date: string | null;
  notes: string | null;
  updated_at?: string | null;
};

type OrderLineRow = {
  id: number;
  order_id: number;
  line_number: number;
  snapshot_product_name: string | null;
};

type QuoteRow = {
  id: number;
  quote_number: string;
  notes: string | null;
};

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
  grand_total: number | null;
  notes: string | null;
  updated_at?: string | null;
};

type QuoteLineRow = {
  id: number;
  quote_version_id: number;
  line_number: number;
  snapshot_product_name: string | null;
};

function currency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

function extractClientName(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/Client:\s*(.+)/i);
  return match?.[1]?.trim() || null;
}

export default function MySalesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLineRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quoteVersions, setQuoteVersions] = useState<QuoteVersionRow[]>([]);
  const [quoteLines, setQuoteLines] = useState<QuoteLineRow[]>([]);
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
            apiGet<{ data: OrderRow[] }>("/api/orders"),
            apiGet<{ data: OrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: QuoteRow[] }>("/api/quotes"),
            apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: QuoteLineRow[] }>("/api/quote-lines"),
          ]);

        if (cancelled) return;

        setOrders(ordersRes.data ?? []);
        setOrderLines(orderLinesRes.data ?? []);
        setQuotes(quotesRes.data ?? []);
        setQuoteVersions(versionsRes.data ?? []);
        setQuoteLines(quoteLinesRes.data ?? []);
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

  const quoteById = useMemo(() => new Map(quotes.map((quote) => [quote.id, quote])), [quotes]);
  const firstQuoteLineByVersion = useMemo(() => {
    const map = new Map<number, QuoteLineRow>();
    for (const line of quoteLines) {
      if (!map.has(line.quote_version_id)) {
        map.set(line.quote_version_id, line);
      }
    }
    return map;
  }, [quoteLines]);
  const firstOrderLineByOrder = useMemo(() => {
    const map = new Map<number, OrderLineRow>();
    for (const line of orderLines) {
      if (!map.has(line.order_id)) {
        map.set(line.order_id, line);
      }
    }
    return map;
  }, [orderLines]);

  const activeQuoteVersions = useMemo(
    () =>
      quoteVersions.filter((version) =>
        ["draft", "prepared", "sent", "accepted"].includes(version.version_status)
      ),
    [quoteVersions]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.order_status !== "completed" && order.order_status !== "cancelled"
      ),
    [orders]
  );

  const paymentAttentionCount = useMemo(
    () =>
      orders.filter(
        (order) => order.payment_status === "unpaid" || order.payment_status === "partially_paid"
      ).length,
    [orders]
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
          A simpler view of quotes and orders that still need seller or manager attention.
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
                Active Quotes
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {activeQuoteVersions.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Quote versions still in motion
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Active Orders
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {activeOrders.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Orders not completed or cancelled
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Payment Follow-up
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {paymentAttentionCount}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Orders still waiting for payment work
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
                  href="/admin/orders"
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Advanced Orders
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Quotes in Progress
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Continue proposal work without digging through technical quote tables.
                </p>
              </div>
              <Link
                href="/admin/quote-versions"
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Open advanced quote versions
              </Link>
            </div>

            {activeQuoteVersions.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-200 px-4 py-4 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No quote versions are active right now.
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
                {activeQuoteVersions.slice(0, 6).map((version) => {
                  const quote = quoteById.get(version.quote_id) ?? null;
                  const firstLine = firstQuoteLineByVersion.get(version.id) ?? null;
                  const customer =
                    extractClientName(version.notes) || extractClientName(quote?.notes) || null;

                  return (
                    <EasySalesCard
                      key={version.id}
                      href={`/admin/quote-versions/${version.id}`}
                      title={
                        quote?.quote_number ||
                        `Quote ${version.quote_id} · Version ${version.version_number}`
                      }
                      customer={customer}
                      itemLabel={firstLine?.snapshot_product_name || null}
                      amount={currency(version.grand_total)}
                      updatedLabel={version.updated_at || "Recently updated"}
                      description="Open the quote version workflow to generate a proposal or continue into order follow-through."
                      primaryStatus={version.version_status}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Orders Requiring Attention
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Focus on the customer commitments that still need payment or completion work.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Open advanced orders
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-200 px-4 py-4 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No active orders need attention right now.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {activeOrders.slice(0, 6).map((order) => {
                  const firstLine = firstOrderLineByOrder.get(order.id) ?? null;

                  return (
                    <EasySalesCard
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      title={order.order_number || `Order ${order.id}`}
                      customer={extractClientName(order.notes)}
                      itemLabel={firstLine?.snapshot_product_name || null}
                      amount={currency(order.grand_total)}
                      updatedLabel={order.updated_at || order.order_date || "Recently updated"}
                      description="Open the order workflow to review payment, documents, and fulfillment follow-through."
                      primaryStatus={order.order_status}
                      secondaryStatus={order.payment_status}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
