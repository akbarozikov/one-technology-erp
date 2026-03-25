"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdminMode } from "@/components/admin/AdminModeProvider";
import { BossControlDashboard } from "@/components/admin/easy/BossControlDashboard";
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
    <section className="app-panel p-5 lg:p-6">
      <div className="mb-4 space-y-1.5">
        <h2 className="app-section-title">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">No data yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item[keyField] ?? "item"}-${index}`}
              className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm"
            >
              <span className="font-mono text-zinc-700 dark:text-zinc-200">{String(item[keyField] ?? "-")}</span>
              <span className="app-chip">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminOverviewPage() {
  const { mode, easyRole } = useAdminMode();
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
        const response = await apiGet<{ data: DashboardOverview }>("/api/dashboard/overview");
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

  if (mode === "easy" && easyRole === "boss") {
    return <BossControlDashboard />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {mode === "easy" ? (
        <>
          <section className="app-panel-strong p-6 lg:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="app-kicker">Seller workspace</p>
                <h1 className="app-page-title">Start work fast and keep live deals moving.</h1>
                <p className="app-page-subtitle">
                  This home is for today's selling work: start a new sale, resume active ones, open the documents you need, and spot anything waiting on you.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/new-sale" className="app-button-primary">Start a new sale</Link>
                <Link href="/admin/my-sales" className="app-button-secondary">Open my sales</Link>
              </div>
            </div>
          </section>

          {configHint && (
            <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
              Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code> in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
            </div>
          )}

          {loading && (
            <section className="app-panel p-5">
              <p className="text-sm text-zinc-500">Loading seller workspace...</p>
            </section>
          )}

          {!loading && error && (
            <section className="rounded-[1.2rem] border border-red-200 bg-red-50/90 p-5 dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </section>
          )}

          {!loading && !error && data && (
            <>
              <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-5 space-y-1.5">
                    <h2 className="app-section-title">Work that matters today</h2>
                    <p className="app-section-subtitle">Lead with actions, not system counters.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Link href="/admin/new-sale" className="app-button-primary min-h-28 flex-col items-start !rounded-[1.25rem] !px-5 !py-5 text-left">
                      <span>Start a new sale</span>
                      <span className="mt-2 text-sm font-normal text-white/80 dark:text-zinc-700">Begin from customer, product, quantity, and price only.</span>
                    </Link>
                    <Link href="/admin/my-sales" className="app-panel-muted flex min-h-28 flex-col px-5 py-5 transition hover:-translate-y-0.5">
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Continue sales in progress</span>
                      <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Pick up deals still waiting for a decision or next step.</span>
                    </Link>
                    <Link href="/admin/documents-lite" className="app-panel-muted flex min-h-28 flex-col px-5 py-5 transition hover:-translate-y-0.5">
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Open my documents</span>
                      <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Jump into proposals, order documents, and generated paperwork quickly.</span>
                    </Link>
                    <Link href="/admin/installations-lite" className="app-panel-muted flex min-h-28 flex-col px-5 py-5 transition hover:-translate-y-0.5">
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Check installations</span>
                      <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">See field follow-through and what might affect the customer next.</span>
                    </Link>
                  </div>
                </section>

                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <h2 className="app-section-title">Needs attention</h2>
                    <p className="app-section-subtitle">A compact read on what may block seller follow-through.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Sales waiting for a decision</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                        {data.quotes_summary.counts_by_status.find((item) => item.status === "sent")?.count ?? 0}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Keep customer follow-up moving while approval is still open.</p>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Open money follow-through</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                        {formatCurrency(data.payments_summary.total_remaining_amount)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Sales already in motion that still need payment attention.</p>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Recent documents ready</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                        {data.documents_summary.recent_generated_documents.length}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Open the latest generated documents without digging through lists.</p>
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <h2 className="app-section-title">Recent documents</h2>
                      <p className="app-section-subtitle">The last customer-facing documents created in the system.</p>
                    </div>
                    <Link href="/admin/documents-lite" className="app-link text-sm">Open documents</Link>
                  </div>
                  {data.documents_summary.recent_generated_documents.length === 0 ? (
                    <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      No generated documents are ready yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.documents_summary.recent_generated_documents.slice(0, 5).map((document) => (
                        <Link key={document.id} href={`/admin/generated-documents/${document.id}`} className="app-panel-muted block px-4 py-4 transition hover:-translate-y-0.5">
                          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                            {document.title || document.document_number || `Document ${document.id}`}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {document.entity_type} - {document.generation_status} - {document.generated_at}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <h2 className="app-section-title">Quick pulse</h2>
                    <p className="app-section-subtitle">Just enough system context to help daily selling work.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Sales in system</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.orders_summary.total_orders}</p>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Recent completed jobs</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.installation_summary.recent_completed_jobs_count}</p>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Documents ready</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.documents_summary.total_generated_documents}</p>
                    </div>
                  </div>
                </section>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="app-page-title text-[2rem]">Advanced dashboard</h1>
            <p className="app-page-subtitle">Practical overview of commercial, operational, and document activity.</p>
          </div>

          {configHint && (
            <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
              Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code> in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
            </div>
          )}

          {loading && (
            <section className="app-panel p-5">
              <p className="text-sm text-zinc-500">Loading dashboard...</p>
            </section>
          )}

          {!loading && error && (
            <section className="rounded-[1.2rem] border border-red-200 bg-red-50/90 p-5 dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </section>
          )}

          {!loading && !error && data && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="app-stat">
                  <p className="app-kicker">Orders</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.orders_summary.total_orders}</p>
                </div>
                <div className="app-stat">
                  <p className="app-kicker">Paid total</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatCurrency(data.payments_summary.total_paid_amount)}</p>
                </div>
                <div className="app-stat">
                  <p className="app-kicker">Active reservations</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.reservations_summary.active_reservations_count}</p>
                </div>
                <div className="app-stat">
                  <p className="app-kicker">Generated documents</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{data.documents_summary.total_generated_documents}</p>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <SummaryList title={`Order statuses (${data.orders_summary.total_orders})`} items={data.orders_summary.counts_by_status} />
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <h2 className="app-section-title">Payments</h2>
                    <p className="app-section-subtitle">Stored order totals and payment status counts.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Grand total</p>
                      <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{formatCurrency(data.payments_summary.total_order_grand_total)}</p>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <p className="app-kicker">Remaining total</p>
                      <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{formatCurrency(data.payments_summary.total_remaining_amount)}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {data.payments_summary.counts_by_payment_status.map((item, index) => (
                      <div key={`${item.status ?? "payment"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                        <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.status}</span>
                        <span className="app-chip">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <SummaryList title={`Reservations (${data.reservations_summary.total_reservations})`} items={data.reservations_summary.counts_by_status} />
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <h2 className="app-section-title">Installation</h2>
                    <p className="app-section-subtitle">{data.installation_summary.recent_completed_jobs_count} completed in the last 7 days.</p>
                  </div>
                  <div className="space-y-2">
                    {data.installation_summary.counts_by_status.map((item, index) => (
                      <div key={`${item.status ?? "job"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                        <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.status}</span>
                        <span className="app-chip">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <SummaryList title={`Quotes (${data.quotes_summary.total_quotes})`} items={data.quotes_summary.counts_by_status} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
