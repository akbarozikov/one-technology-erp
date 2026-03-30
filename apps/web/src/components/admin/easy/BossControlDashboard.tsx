"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import { EasySalesCard } from "@/components/admin/easy/EasySalesCard";
import { useI18n } from "@/components/admin/LanguageProvider";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
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

type DashboardOverview = {
  orders_summary: {
    total_orders: number;
    counts_by_status: Array<{ status?: string; count: number }>;
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

export function BossControlDashboard() {
  const { hasAnyPermission } = useAuth();
  const { t, formatCurrency, adminText } = useI18n();
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
              : t("bossDashboard.loadFailed")
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
  }, [t]);

  const awaitingApproval = useMemo(() => sales.filter((sale) => sale.status === "Pending"), [sales]);
  const needsAttention = useMemo(() => sales.filter((sale) => sale.status === "Needs changes"), [sales]);
  const recentlyApproved = useMemo(() => sales.filter((sale) => sale.status === "Approved").slice(0, 4), [sales]);
  const recentlyRejected = useMemo(() => sales.filter((sale) => sale.status === "Rejected").slice(0, 4), [sales]);
  const salesInProgress = useMemo(
    () => sales.filter((sale) => sale.status === "Pending" || sale.status === "Needs changes"),
    [sales]
  );

  const canReviewApprovals = hasAnyPermission(["approvals.review"]);
  const canViewSales = hasAnyPermission(["sales.view_all", "sales.view_own"]);
  const canViewPayments = hasAnyPermission(["payments.view"]);
  const canViewOperations = hasAnyPermission(["operations.view"]);
  const canViewDocuments = hasAnyPermission(["documents.view"]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="app-panel-strong p-6 lg:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="app-kicker">{t("bossDashboard.workspace")}</p>
            <h1 className="app-page-title">{t("bossDashboard.title")}</h1>
            <p className="app-page-subtitle">
              {t("bossDashboard.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canReviewApprovals && (
              <Link href="/admin/approvals" className="app-button-primary">{t("bossDashboard.reviewApprovals")}</Link>
            )}
            {canViewSales && (
              <Link href="/admin/quote-versions" className="app-button-secondary">{t("bossDashboard.openAdvancedErp")}</Link>
            )}
          </div>
        </div>
      </section>

      {configHint && (
        <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
          {adminText("Set")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code> {adminText("in")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      {loading && (
        <section className="app-panel p-5">
          <p className="text-sm text-zinc-500">{t("bossDashboard.loading")}</p>
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
            {canReviewApprovals && (
              <div className="app-stat">
                <p className="app-kicker">{t("bossDashboard.awaitingApproval")}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{awaitingApproval.length}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("bossDashboard.awaitingApprovalBody")}</p>
              </div>
            )}
            {canViewSales && (
              <div className="app-stat">
                <p className="app-kicker">{t("bossDashboard.salesInProgress")}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{salesInProgress.length}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("bossDashboard.salesInProgressBody")}</p>
              </div>
            )}
            {canReviewApprovals && (
              <div className="app-stat">
                <p className="app-kicker">{t("bossDashboard.needsAttention")}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{needsAttention.length}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("bossDashboard.needsAttentionBody")}</p>
              </div>
            )}
            {canViewPayments && (
              <div className="app-stat">
                <p className="app-kicker">{t("bossDashboard.cashOutstanding")}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatCurrency(overview.payments_summary.total_remaining_amount)}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("bossDashboard.cashOutstandingBody")}</p>
              </div>
            )}
          </section>

          <section className="app-panel p-5 lg:p-6">
            <div className="mb-5 space-y-1.5">
              <h2 className="app-section-title">{t("bossDashboard.quickActions")}</h2>
              <p className="app-section-subtitle">{t("bossDashboard.quickActionsBody")}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {canReviewApprovals && (
                <Link href="/admin/approvals" className="app-button-primary min-h-24 flex-col items-start !rounded-[1.2rem] !px-4 !py-4 text-left">
                  <span>{t("bossDashboard.reviewApprovals")}</span>
                  <span className="mt-1 text-sm font-normal text-white/80 dark:text-zinc-700">{t("bossDashboard.openInbox")}</span>
                </Link>
              )}
              {canViewSales && (
                <Link href="/admin/my-sales" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                  <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{t("bossDashboard.openSalesInProgress")}</span>
                  <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("bossDashboard.openSalesInProgressBody")}</span>
                </Link>
              )}
              {canViewPayments && (
                <Link href="/admin/payments-debt" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                  <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{t("bossDashboard.checkPaymentsDebt")}</span>
                  <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("bossDashboard.checkPaymentsDebtBody")}</span>
                </Link>
              )}
              {canViewOperations && (
                <Link href="/admin/expenses-adjustments" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                  <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{t("bossDashboard.checkExpensesInventory")}</span>
                  <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("bossDashboard.checkExpensesInventoryBody")}</span>
                </Link>
              )}
              {canViewDocuments && (
                <Link href="/admin/documents-lite" className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5">
                  <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{t("bossDashboard.checkDocuments")}</span>
                  <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("bossDashboard.checkDocumentsBody")}</span>
                </Link>
              )}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            {canReviewApprovals && (
              <section className="app-panel p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <h2 className="app-section-title">{t("bossDashboard.awaitingApprovalSection")}</h2>
                    <p className="app-section-subtitle">{t("bossDashboard.awaitingApprovalSectionBody")}</p>
                  </div>
                  <Link href="/admin/approvals" className="app-link text-sm">{t("bossDashboard.openInbox")}</Link>
                </div>
                <div className="space-y-3">
                  {awaitingApproval.length === 0 ? (
                    <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {t("bossDashboard.noAwaitingApproval")}
                    </div>
                  ) : (
                    awaitingApproval.slice(0, 3).map((sale) => (
                      <EasySalesCard key={sale.id} sale={sale} href={sale.detailHref} extraBadge={sale.seller || sale.stageLabel} description={t("bossDashboard.approvalDescription")} />
                    ))
                  )}
                </div>
              </section>
            )}

            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 space-y-1.5">
                <h2 className="app-section-title">{t("bossDashboard.oversightSnapshot")}</h2>
                <p className="app-section-subtitle">{t("bossDashboard.oversightSnapshotBody")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {canViewSales && (
                  <div className="app-panel-muted px-4 py-4">
                    <p className="app-kicker">{t("bossDashboard.ordersTracked")}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.orders_summary.total_orders}</p>
                  </div>
                )}
                {canViewDocuments && (
                  <div className="app-panel-muted px-4 py-4">
                    <p className="app-kicker">{t("dashboard.documentsReady")}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.documents_summary.total_generated_documents}</p>
                  </div>
                )}
                {canViewPayments && (
                  <div className="app-panel-muted px-4 py-4">
                    <p className="app-kicker">{t("bossDashboard.cashReceived")}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatCurrency(overview.payments_summary.total_paid_amount)}</p>
                  </div>
                )}
                {canViewOperations && (
                  <div className="app-panel-muted px-4 py-4">
                    <p className="app-kicker">{t("bossDashboard.recentCompletions")}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{overview.installation_summary.recent_completed_jobs_count}</p>
                  </div>
                )}
              </div>
            </section>
          </section>

          {canViewSales && (
            <section className="grid gap-4 xl:grid-cols-2">
              <section className="app-panel p-5 lg:p-6">
                <div className="mb-4 space-y-1.5">
                  <h2 className="app-section-title">{t("bossDashboard.recentlyApproved")}</h2>
                  <p className="app-section-subtitle">{t("bossDashboard.recentlyApprovedBody")}</p>
                </div>
                <div className="space-y-3">
                  {recentlyApproved.length === 0 ? (
                    <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {t("bossDashboard.noRecentApprovals")}
                    </div>
                  ) : (
                    recentlyApproved.map((sale) => (
                      <EasySalesCard key={sale.id} sale={sale} href={sale.advancedHref} extraBadge={sale.seller || sale.stageLabel} description={`${t("bossDashboard.approvedAmountPrefix")} ${formatMoney(sale.amount)}.`} />
                    ))
                  )}
                </div>
              </section>

              {canReviewApprovals && (
                <section className="app-panel p-5 lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <h2 className="app-section-title">{t("bossDashboard.recentlyRejected")}</h2>
                    <p className="app-section-subtitle">{t("bossDashboard.recentlyRejectedBody")}</p>
                  </div>
                  <div className="space-y-3">
                    {recentlyRejected.length === 0 ? (
                      <div className="app-empty text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {t("bossDashboard.noRecentRejections")}
                      </div>
                    ) : (
                      recentlyRejected.map((sale) => (
                        <EasySalesCard
                          key={sale.id}
                          sale={sale}
                          href={sale.detailHref}
                          extraBadge={sale.seller || sale.stageLabel}
                          description={sale.decisionComment ? `${t("dashboard.followUp")}: ${sale.decisionComment}` : t("bossDashboard.rejectedDescriptionFallback")}
                        />
                      ))
                    )}
                  </div>
                </section>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
