"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";

type CountItem = {
  status?: string;
  movement_type?: string;
  count: number;
};

type RecentGeneratedDocument = {
  id: number;
  title: string;
  document_number: string | null;
  entity_type: string;
  generation_status: string;
  generated_at: string;
};

type RecentStockMovement = {
  id: number;
  movement_type: string;
  status: string;
  reference_code: string | null;
  movement_date: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
};

type DashboardOverview = {
  orders_summary: {
    total_orders: number;
    counts_by_status: CountItem[];
  };
  payments_summary: {
    counts_by_payment_status: CountItem[];
    total_paid_amount: number;
    total_remaining_amount: number;
    total_order_grand_total: number;
  };
  reservations_summary: {
    total_reservations: number;
    active_reservations_count: number;
    counts_by_status: CountItem[];
  };
  installation_summary: {
    total_jobs: number;
    recent_completed_jobs_count: number;
    counts_by_status: CountItem[];
  };
  documents_summary: {
    total_generated_documents: number;
    recent_generated_documents: RecentGeneratedDocument[];
  };
  warehouse_summary: {
    total_stock_movements: number;
    counts_by_movement_type: CountItem[];
    recent_stock_movements: RecentStockMovement[];
  };
  quotes_summary: {
    total_quotes: number;
    counts_by_status: CountItem[];
  };
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function SummaryList({
  title,
  items,
  keyField = "status",
}: {
  title: string;
  items: CountItem[];
  keyField?: "status" | "movement_type";
}) {
  return (
    <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item[keyField] ?? "item"}-${index}`}
              className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span className="font-mono text-zinc-700 dark:text-zinc-200">
                {String(item[keyField] ?? "-")}
              </span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
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
        const response = await apiGet<{ data: DashboardOverview }>(
          "/api/dashboard/overview"
        );
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load dashboard."
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Practical overview of commercial, operational, and document activity.
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
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Orders</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {data.orders_summary.total_orders}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Paid Total</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(data.payments_summary.total_paid_amount)}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Active Reservations
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {data.reservations_summary.active_reservations_count}
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Generated Documents
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {data.documents_summary.total_generated_documents}
              </p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SummaryList
              title={`Order Statuses (${data.orders_summary.total_orders})`}
              items={data.orders_summary.counts_by_status}
            />
            <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Payments
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Grand Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(data.payments_summary.total_order_grand_total)}
                  </p>
                </div>
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Remaining Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(data.payments_summary.total_remaining_amount)}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data.payments_summary.counts_by_payment_status.map((item, index) => (
                  <div
                    key={`${item.status ?? "payment"}-${index}`}
                    className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <span className="font-mono text-zinc-700 dark:text-zinc-200">
                      {item.status}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <SummaryList
              title={`Reservations (${data.reservations_summary.total_reservations})`}
              items={data.reservations_summary.counts_by_status}
            />
            <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Installation
              </h2>
              <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                {data.installation_summary.recent_completed_jobs_count} completed in the last 7 days.
              </p>
              <div className="space-y-2">
                {data.installation_summary.counts_by_status.map((item, index) => (
                  <div
                    key={`${item.status ?? "job"}-${index}`}
                    className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <span className="font-mono text-zinc-700 dark:text-zinc-200">
                      {item.status}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <SummaryList
              title={`Quotes (${data.quotes_summary.total_quotes})`}
              items={data.quotes_summary.counts_by_status}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Recent Generated Documents
                </h2>
                <Link
                  href="/admin/generated-documents"
                  className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  View all
                </Link>
              </div>
              {data.documents_summary.recent_generated_documents.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No generated documents yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.documents_summary.recent_generated_documents.map((document) => (
                    <div
                      key={document.id}
                      className="rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <Link
                        href={`/admin/generated-documents/${document.id}`}
                        className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        {document.title || document.document_number || `Document ${document.id}`}
                      </Link>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {document.entity_type} · {document.generation_status} · {document.generated_at}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Recent Stock Movements
                </h2>
                <Link
                  href="/admin/stock-movements"
                  className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  View all
                </Link>
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {data.warehouse_summary.counts_by_movement_type.map((item, index) => (
                  <div
                    key={`${item.movement_type ?? "movement"}-${index}`}
                    className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <span className="font-mono text-zinc-700 dark:text-zinc-200">
                      {item.movement_type}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
              {data.warehouse_summary.recent_stock_movements.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No stock movements yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.warehouse_summary.recent_stock_movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {movement.reference_code || `Movement ${movement.id}`}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {movement.movement_type} · {movement.status} · {movement.movement_date}
                      </div>
                      {(movement.related_entity_type || movement.related_entity_id) && (
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {movement.related_entity_type || "related"} · {movement.related_entity_id || "-"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </>
      )}
    </div>
  );
}
