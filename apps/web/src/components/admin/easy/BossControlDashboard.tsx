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
        const [
          overviewRes,
          ordersRes,
          orderLinesRes,
          quotesRes,
          versionsRes,
          quoteLinesRes,
          usersRes,
        ] = await Promise.all([
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

  const awaitingApproval = useMemo(
    () => sales.filter((sale) => sale.status === "Pending"),
    [sales]
  );
  const needsAttention = useMemo(
    () => sales.filter((sale) => sale.status === "Needs changes"),
    [sales]
  );
  const recentlyApproved = useMemo(
    () => sales.filter((sale) => sale.status === "Approved").slice(0, 4),
    [sales]
  );
  const recentlyRejected = useMemo(
    () => sales.filter((sale) => sale.status === "Rejected").slice(0, 4),
    [sales]
  );
  const salesInProgress = useMemo(
    () => sales.filter((sale) => sale.status === "Pending" || sale.status === "Needs changes"),
    [sales]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Boss Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Start here for decisions, oversight, and the next management actions that matter today.
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
          <p className="text-sm text-zinc-500">Loading boss dashboard...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && overview && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Awaiting Approval
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {awaitingApproval.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Sales waiting for a manager call
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Sales In Progress
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {salesInProgress.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Active sales still moving forward
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Needs Attention
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {needsAttention.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Sales already sent back for changes
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Cash Still Outstanding
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(overview.payments_summary.total_remaining_amount)}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Remaining across current orders
              </p>
            </div>
          </section>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Quick Control Actions
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Link
                href="/admin/approvals"
                className="rounded border border-zinc-900 bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <div className="font-medium">Review approvals</div>
                <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-700">
                  Go straight to the decision inbox.
                </p>
              </Link>
              <Link
                href="/admin/my-sales"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Open sales in progress</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Check the active sales pipeline in product terms.
                </p>
              </Link>
              <Link
                href="/admin/payments-debt"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Check payments & debt</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  See what is paid, open, overdue, or risky.
                </p>
              </Link>
              <Link
                href="/admin/expenses-adjustments"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Check expenses & inventory</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Review supplier spend, writeoffs, and manual stock corrections.
                </p>
              </Link>
              <Link
                href="/admin/quote-versions"
                className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Open advanced ERP</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Switch into the deeper commercial controls when needed.
                </p>
              </Link>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Awaiting Approval
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    The next decisions that need a boss response.
                  </p>
                </div>
                <Link
                  href="/admin/approvals"
                  className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Open inbox
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {awaitingApproval.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No sales are waiting for approval right now.
                  </p>
                ) : (
                  awaitingApproval.slice(0, 3).map((sale) => (
                    <EasySalesCard
                      key={sale.id}
                      sale={sale}
                      href={sale.detailHref}
                      extraBadge={sale.seller || sale.stageLabel}
                      description="Open the decision inbox to approve, send back, or reject."
                    />
                  ))
                )}
              </div>
            </section>

            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Oversight Snapshot
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Orders tracked</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {overview.orders_summary.total_orders}
                  </p>
                </div>
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Documents ready</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {overview.documents_summary.total_generated_documents}
                  </p>
                </div>
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Cash received</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(overview.payments_summary.total_paid_amount)}
                  </p>
                </div>
                <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Recent completions</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {overview.installation_summary.recent_completed_jobs_count}
                  </p>
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Recently Approved
              </h2>
              <div className="mt-4 space-y-3">
                {recentlyApproved.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No recent approvals have been recorded in the lightweight control layer yet.
                  </p>
                ) : (
                  recentlyApproved.map((sale) => (
                    <EasySalesCard
                      key={sale.id}
                      sale={sale}
                      href={sale.advancedHref}
                      extraBadge={sale.seller || sale.stageLabel}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Recently Rejected
              </h2>
              <div className="mt-4 space-y-3">
                {recentlyRejected.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No recent rejections are showing right now.
                  </p>
                ) : (
                  recentlyRejected.map((sale) => (
                    <EasySalesCard
                      key={sale.id}
                      sale={sale}
                      href={sale.detailHref}
                      extraBadge={sale.seller || sale.stageLabel}
                      description={
                        sale.decisionComment
                          ? `Reason: ${sale.decisionComment}`
                          : "Open the review page if you want to revisit the decision note."
                      }
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
