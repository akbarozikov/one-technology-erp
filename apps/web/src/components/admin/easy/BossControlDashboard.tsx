"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import { EasySalesCard } from "@/components/admin/easy/EasySalesCard";
import {
  buildSales,
  formatMoney,
  type Sale,
  type SaleOrderLineRow,
  type SaleOrderRow,
  type SaleQuoteLineRow,
  type SaleQuoteRow,
  type SaleQuoteVersionRow,
  type SaleUserRow,
} from "@/lib/easy-sales";
import { loadEasyApprovalRecords } from "@/lib/easy-approvals";

type CountItem = {
  status?: string;
  count: number;
};

type DashboardOverview = {
  orders_summary: {
    total_orders: number;
    counts_by_status: CountItem[];
  };
  payments_summary: {
    total_paid_amount: number;
    total_remaining_amount: number;
  };
  installation_summary: {
    total_jobs: number;
    recent_completed_jobs_count: number;
  };
  documents_summary: {
    total_generated_documents: number;
  };
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function BossControlDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
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
        const [overviewRes, ordersRes, orderLinesRes, quotesRes, versionsRes, quoteLinesRes, usersRes] =
          await Promise.all([
            apiGet<{ data: DashboardOverview }>("/api/dashboard/overview"),
            apiGet<{ data: SaleOrderRow[] }>("/api/orders"),
            apiGet<{ data: SaleOrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: SaleQuoteRow[] }>("/api/quotes"),
            apiGet<{ data: SaleQuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: SaleQuoteLineRow[] }>("/api/quote-lines"),
            apiGet<{ data: SaleUserRow[] }>("/api/users"),
          ]);

        if (cancelled) return;

        const approvalRecords = loadEasyApprovalRecords();

        setOverview(overviewRes.data);
        setSales(
          buildSales({
            quotes: quotesRes.data ?? [],
            quoteVersions: versionsRes.data ?? [],
            quoteLines: quoteLinesRes.data ?? [],
            orders: ordersRes.data ?? [],
            orderLines: orderLinesRes.data ?? [],
            users: usersRes.data ?? [],
            approvalRecords,
          })
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load the boss dashboard."
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

  const awaitingApproval = useMemo(() => sales.filter((sale) => sale.status === "Pending"), [sales]);
  const needsAttention = useMemo(() => sales.filter((sale) => sale.status === "Needs changes"), [sales]);
  const recentlyApproved = useMemo(() => sales.filter((sale) => sale.status === "Approved").slice(0, 4), [sales]);
  const recentlyRejected = useMemo(() => sales.filter((sale) => sale.status === "Rejected").slice(0, 4), [sales]);
  const salesInProgress = useMemo(
    () => sales.filter((sale) => sale.status === "Pending" || sale.status === "Needs changes"),
    [sales]
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="app-panel-strong p-6 lg:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="app-kicker">Boss workspace</p>
            <h1 className="app-page-title">Run the business from one clear control surface.</h1>
            <p className="app-page-subtitle">
              Decisions, cash exposure, document output, and operational pressure points are collected here so management work feels directed instead of buried in raw ERP lists.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/approvals" className="app-button-primary">Review approvals</Link>
            <Link href="/admin/quote-versions" className="app-button-secondary">Open advanced ERP</Link>
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
          <p className="text-sm text-zinc-500">Loading boss dashboard...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[1.2rem] border border-red-200 bg-red-50/90 p-5 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && overview && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="app-stat">
              <p className="app-kicker">Awaiting approval</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{awaitingApproval.length}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Sales waiting for a manager call.</p>
            </div>
            <div className="app-stat">
              <p className="app-kicker">Sales in progress</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{salesInProgress.length}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Active opportunities still moving forward.</p>
            </div>
            <div className="app-stat">
              <p className="app-kicker">Needs attention</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{needsAttention.length}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Sales already sent back for another pass.</p>
            </div>
            <div className="app-stat">
              <p className="app-kicker">Cash still outstanding</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatCurrency(overview.payments_summary.total_remaining_amount)}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Remaining across current orders.</p>
            </div>
          </section>

          <section className="app-panel p-5 lg:p-6">
            <div className="mb-5 space-y-1.5">
              <h2 className="app-section-title">Quick control actions</h2>
              <p className="app-section-subtitle">Start from a management intent, then hand off into the deeper ERP only when the situation truly needs it.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Link href="/admin/approvals" className="app-button-primary min-h-24 flex-col items-start !rounded-[1.2rem] !px-4 !py-4 text-left">
                <span>Review approvals</span>
                <span className="mt-1 text-sm font-normal text-white/80 dark:text-zinc-700">Go straight to the decision inbox.</span>
              </Link>
              <Link href="/admin/my-sales" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Open sales in progress</span>
                <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Check the active sales pipeline in product terms.</span>
              </Link>
              <Link href="/admin/payments-debt" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Check payments & debt</span>
                <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">See what is paid, open, overdue, or risky.</span>
              </Link>
              <Link href="/admin/expenses-adjustments" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Check expenses & inventory</span>
                <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Review supplier spend, writeoffs, and manual corrections.</span>
              </Link>
              <Link href="/admin/documents-lite" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Check documents</span>
                <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Open proposals, orders, and field-ready documents quickly.</span>
              </Link>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <h2 className="app-section-title">Awaiting approval</h2>
                  <p className="app-section-subtitle">The next sales decisions that need a boss response.</p>
                </div>
                <Link href="/admin/approvals" className="app-link text-sm">Open inbox</Link>
              </div>
              <div className="space-y-3">
                {awaitingApproval.length === 0 ? (
                  <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    No sales are waiting for approval right now.
                  </div>
                ) : (
                  awaitingApproval.slice(0, 3).map((sale) => (
                    <EasySalesCard key={sale.id} sale={sale} href={sale.detailHref} extraBadge={sale.seller || sale.stageLabel} description="Open the decision inbox to approve, send back, or reject." />
                  ))
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 space-y-1.5">
                <h2 className="app-section-title">Oversight snapshot</h2>
                <p className="app-section-subtitle">A compact read on commercial activity, cash, documents, and field completion.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="app-panel-muted px-4 py-4">
                  <p className="app-kicker">Orders tracked</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.orders_summary.total_orders}</p>
                </div>
                <div className="app-panel-muted px-4 py-4">
                  <p className="app-kicker">Documents ready</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.documents_summary.total_generated_documents}</p>
                </div>
                <div className="app-panel-muted px-4 py-4">
                  <p className="app-kicker">Cash received</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatCurrency(overview.payments_summary.total_paid_amount)}</p>
                </div>
                <div className="app-panel-muted px-4 py-4">
                  <p className="app-kicker">Recent completions</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.installation_summary.recent_completed_jobs_count}</p>
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 space-y-1.5">
                <h2 className="app-section-title">Recently approved</h2>
                <p className="app-section-subtitle">Sales that already cleared the main decision step.</p>
              </div>
              <div className="space-y-3">
                {recentlyApproved.length === 0 ? (
                  <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    No recent approvals have been recorded in the lightweight control layer yet.
                  </div>
                ) : (
                  recentlyApproved.map((sale) => (
                    <EasySalesCard key={sale.id} sale={sale} href={sale.advancedHref} extraBadge={sale.seller || sale.stageLabel} description={`Approved amount: ${formatMoney(sale.amount)}.`} />
                  ))
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 space-y-1.5">
                <h2 className="app-section-title">Recently rejected</h2>
                <p className="app-section-subtitle">Decisions that may need follow-up or clearer direction back to the team.</p>
              </div>
              <div className="space-y-3">
                {recentlyRejected.length === 0 ? (
                  <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    No recent rejections are showing right now.
                  </div>
                ) : (
                  recentlyRejected.map((sale) => (
                    <EasySalesCard
                      key={sale.id}
                      sale={sale}
                      href={sale.detailHref}
                      extraBadge={sale.seller || sale.stageLabel}
                      description={sale.decisionComment ? `Reason: ${sale.decisionComment}` : "Open the review page if you want to revisit the decision note."}
                    />
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
