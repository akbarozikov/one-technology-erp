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
              <section className="app-panel-strong p-6 lg:p-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl space-y-2">
                    <p className="app-kicker">Seller workspace</p>
                    <h1 className="text-[1.7rem] font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      Start the next sale or continue the one already moving.
                    </h1>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      Keep the day centered on customer progress, not ERP setup. Start quickly, pick up active deals, and reach the next useful document or follow-up without extra detours.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <Link href="/admin/new-sale" className="app-button-primary">
                      Start a new sale
                    </Link>
                    <Link href="/admin/my-sales" className="app-button-secondary">
                      Open my sales
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
                  <Link
                    href="/admin/new-sale"
                    className="app-button-primary min-h-36 flex-col items-start justify-between !rounded-[1.35rem] !px-5 !py-5 text-left"
                  >
                    <span className="text-base">Start a new sale</span>
                    <span className="text-sm font-normal leading-6 text-white/80 dark:text-zinc-700">
                      Begin with customer, product, quantity, and price only.
                    </span>
                  </Link>
                  <Link
                    href="/admin/my-sales"
                    className="app-panel-muted flex min-h-36 flex-col justify-between px-5 py-5 transition hover:-translate-y-0.5"
                  >
                    <div>
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Continue sales in progress</span>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        Re-open deals that still need a customer response, a manager decision, or the next follow-through step.
                      </p>
                    </div>
                    <span className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">Go to my sales</span>
                  </Link>
                  <div className="grid gap-3">
                    <Link
                      href="/admin/documents-lite"
                      className="app-panel-muted flex min-h-[5.75rem] flex-col justify-center px-4 py-4 transition hover:-translate-y-0.5"
                    >
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Open my documents</span>
                      <span className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Jump into proposals, orders, and ready paperwork.</span>
                    </Link>
                    <Link
                      href="/admin/installations-lite"
                      className="app-panel-muted flex min-h-[5.75rem] flex-col justify-center px-4 py-4 transition hover:-translate-y-0.5"
                    >
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Check installations</span>
                      <span className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">See field follow-through that may affect the next customer step.</span>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <h2 className="app-section-title">Needs attention</h2>
                      <p className="app-section-subtitle">A short action list for work that can stall if nobody picks it up.</p>
                    </div>
                    <span className="app-chip app-badge-warning">Act now</span>
                  </div>
                  <div className="space-y-3">
                    <div className="app-panel-muted px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="app-kicker">Sales waiting for a decision</p>
                          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                            {data.quotes_summary.counts_by_status.find((item) => item.status === "sent")?.count ?? 0}
                          </p>
                        </div>
                        <span className="app-chip app-badge-warning">Manager step</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        These deals are already in motion. Review them first so the customer is not left waiting.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href="/admin/my-sales" className="app-link text-sm">
                          Review active sales
                        </Link>
                        <Link href="/admin/approvals" className="app-link text-sm">
                          Check approvals
                        </Link>
                      </div>
                    </div>
                    <div className="app-panel-muted px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="app-kicker">Open money follow-through</p>
                          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                            {formatCurrency(data.payments_summary.total_remaining_amount)}
                          </p>
                        </div>
                        <span className="app-chip">Follow up</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        Some active sales still need payment movement or a customer callback before they can close cleanly.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href="/admin/my-sales" className="app-link text-sm">
                          Open my sales
                        </Link>
                        <Link href="/admin/documents-lite" className="app-link text-sm">
                          Open documents
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <h2 className="app-section-title">Recent documents</h2>
                      <p className="app-section-subtitle">The latest customer-facing documents you may need next.</p>
                    </div>
                    <Link href="/admin/documents-lite" className="app-link text-sm">
                      Open documents
                    </Link>
                  </div>
                  {data.documents_summary.recent_generated_documents.length === 0 ? (
                    <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      No generated documents are ready yet. Start a sale or continue one in progress to create the next proposal or order document.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.documents_summary.recent_generated_documents.slice(0, 4).map((document) => (
                        <Link
                          key={document.id}
                          href={`/admin/generated-documents/${document.id}`}
                          className="app-panel-muted block px-4 py-4 transition hover:-translate-y-0.5"
                        >
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
              </section>

              <section className="app-panel-muted px-4 py-4 lg:px-5 lg:py-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="app-kicker">Quick pulse</p>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      A light supporting read on the day, kept secondary on purpose.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[34rem] lg:max-w-[42rem]">
                    <div className="flex items-center justify-between rounded-full border border-black/8 bg-white/55 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/4">
                      <span className="text-zinc-600 dark:text-zinc-300">Sales in system</span>
                      <span className="font-semibold text-zinc-950 dark:text-zinc-50">{data.orders_summary.total_orders}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full border border-black/8 bg-white/55 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/4">
                      <span className="text-zinc-600 dark:text-zinc-300">Completed jobs</span>
                      <span className="font-semibold text-zinc-950 dark:text-zinc-50">{data.installation_summary.recent_completed_jobs_count}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full border border-black/8 bg-white/55 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/4">
                      <span className="text-zinc-600 dark:text-zinc-300">Documents ready</span>
                      <span className="font-semibold text-zinc-950 dark:text-zinc-50">{data.documents_summary.total_generated_documents}</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <section className="app-panel-strong p-6 lg:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="app-kicker">Advanced workspace</p>
                <h1 className="app-page-title text-[2rem]">Advanced dashboard</h1>
                <p className="app-page-subtitle">
                  Practical oversight across commercial, operational, warehouse, and document activity, arranged for faster scanning.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/quote-versions" className="app-button-secondary">
                  Open quotes
                </Link>
                <Link href="/admin/orders" className="app-button-secondary">
                  Open orders
                </Link>
              </div>
            </div>

            {configHint && (
              <div className="mt-5 rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
                Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code> in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
              </div>
            )}

            {loading && (
              <section className="mt-5 app-panel p-5">
                <p className="text-sm text-zinc-500">Loading dashboard...</p>
              </section>
            )}

            {!loading && error && (
              <section className="mt-5 rounded-[1.2rem] border border-red-200 bg-red-50/90 p-5 dark:border-red-900 dark:bg-red-950/40">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </section>
            )}

            {!loading && !error && data && (
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            )}
          </section>

          {!loading && !error && data && (
            <>
              <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <p className="app-kicker">Commercial pulse</p>
                    <h2 className="app-section-title">Orders and payments</h2>
                    <p className="app-section-subtitle">Use this block first for the commercial state that drives daily follow-through.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-2">
                      {data.orders_summary.counts_by_status.map((item, index) => (
                        <div key={`${item.status ?? "order"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                          <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.status}</span>
                          <span className="app-chip">{item.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="app-panel-muted px-4 py-4">
                        <p className="app-kicker">Grand total</p>
                        <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{formatCurrency(data.payments_summary.total_order_grand_total)}</p>
                      </div>
                      <div className="app-panel-muted px-4 py-4">
                        <p className="app-kicker">Remaining total</p>
                        <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{formatCurrency(data.payments_summary.total_remaining_amount)}</p>
                      </div>
                      <div className="space-y-2">
                        {data.payments_summary.counts_by_payment_status.map((item, index) => (
                          <div key={`${item.status ?? "payment"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                            <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.status}</span>
                            <span className="app-chip">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <p className="app-kicker">Operations pulse</p>
                    <h2 className="app-section-title">Reservations, jobs, and quotes</h2>
                    <p className="app-section-subtitle">A tighter read on the operational state supporting the commercial flow.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reservations</span>
                        <span className="app-chip">{data.reservations_summary.total_reservations}</span>
                      </div>
                      <div className="space-y-2">
                        {data.reservations_summary.counts_by_status.map((item, index) => (
                          <div key={`${item.status ?? "reservation"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                            <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.status}</span>
                            <span className="app-chip">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="app-panel-muted px-4 py-4">
                        <p className="app-kicker">Installation</p>
                        <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{data.installation_summary.total_jobs}</p>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{data.installation_summary.recent_completed_jobs_count} completed in the last 7 days.</p>
                      </div>
                      <div className="app-panel-muted px-4 py-4">
                        <p className="app-kicker">Quotes</p>
                        <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{data.quotes_summary.total_quotes}</p>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Current quote activity across active, sent, and completed stages.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="app-kicker">Documents</p>
                      <h2 className="app-section-title">Recent generated output</h2>
                      <p className="app-section-subtitle">A quieter review area for what is already ready to use.</p>
                    </div>
                    <Link href="/admin/generated-documents" className="app-link text-sm">
                      Open documents
                    </Link>
                  </div>
                  {data.documents_summary.recent_generated_documents.length === 0 ? (
                    <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">No generated documents yet.</div>
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
                    <p className="app-kicker">Warehouse context</p>
                    <h2 className="app-section-title">Movement types</h2>
                    <p className="app-section-subtitle">A compact supporting read on stock movement activity.</p>
                  </div>
                  <div className="mb-3 app-panel-muted px-4 py-4">
                    <p className="app-kicker">Total stock movements</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{data.warehouse_summary.total_stock_movements}</p>
                  </div>
                  <div className="space-y-2">
                    {data.warehouse_summary.counts_by_movement_type.map((item, index) => (
                      <div key={`${item.movement_type ?? "movement"}-${index}`} className="app-panel-muted flex items-center justify-between px-3 py-3 text-sm">
                        <span className="font-mono text-zinc-700 dark:text-zinc-200">{item.movement_type}</span>
                        <span className="app-chip">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}





