"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import { EasySalesCard } from "@/components/admin/easy/EasySalesCard";
import {
  buildSales,
  type Sale,
  type SaleOrderLineRow,
  type SaleOrderRow,
  type SaleQuoteLineRow,
  type SaleQuoteRow,
  type SaleQuoteVersionRow,
  type SaleUserRow,
} from "@/lib/easy-sales";
import {
  loadEasyApprovalRecords,
  saveEasyApprovalRecord,
  type EasyApprovalDecision,
  type EasyApprovalRecord,
} from "@/lib/easy-approvals";

function QuickActionButton({
  label,
  onClick,
  tone = "neutral",
}: {
  label: string;
  onClick: () => void;
  tone?: "primary" | "warning" | "danger" | "neutral";
}) {
  const className =
    tone === "primary"
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : tone === "warning"
        ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
        : tone === "danger"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-1.5 text-sm ${className}`}
    >
      {label}
    </button>
  );
}

export default function ApprovalsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [approvalRecords, setApprovalRecords] = useState<Record<string, EasyApprovalRecord>>({});
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
        const [versionsRes, quotesRes, quoteLinesRes, ordersRes, orderLinesRes, usersRes] =
          await Promise.all([
            apiGet<{ data: SaleQuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: SaleQuoteRow[] }>("/api/quotes"),
            apiGet<{ data: SaleQuoteLineRow[] }>("/api/quote-lines"),
            apiGet<{ data: SaleOrderRow[] }>("/api/orders"),
            apiGet<{ data: SaleOrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: SaleUserRow[] }>("/api/users"),
          ]);

        if (cancelled) return;

        const records = loadEasyApprovalRecords();
        setApprovalRecords(records);
        setSales(
          buildSales({
            quotes: quotesRes.data ?? [],
            quoteVersions: versionsRes.data ?? [],
            quoteLines: quoteLinesRes.data ?? [],
            orders: ordersRes.data ?? [],
            orderLines: orderLinesRes.data ?? [],
            users: usersRes.data ?? [],
            approvalRecords: records,
          }).filter((sale) => sale.status === "Pending" || sale.status === "Needs changes")
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load sales awaiting approval."
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

  function applyDecision(sale: Sale, decision: EasyApprovalDecision) {
    const nextRecords = saveEasyApprovalRecord(sale.id, {
      decision,
      comment: sale.decisionComment ?? "",
      savedAt: new Date().toISOString(),
    });
    setApprovalRecords(nextRecords);
    setSales((current) =>
      current.map((item) =>
        item.id === sale.id
          ? {
              ...item,
              decision,
              status:
                decision === "approve"
                  ? "Approved"
                  : decision === "send_back"
                    ? "Needs changes"
                    : "Rejected",
            }
          : item
      )
    );
  }

  const pendingSales = useMemo(() => sales.filter((sale) => sale.status === "Pending"), [sales]);
  const needsChangesSales = useMemo(
    () => sales.filter((sale) => sale.status === "Needs changes"),
    [sales]
  );
  const visibleSales = useMemo(
    () => sales.filter((sale) => sale.status === "Pending" || sale.status === "Needs changes"),
    [sales]
  );
  const decisionCount = useMemo(
    () => Object.keys(approvalRecords).length,
    [approvalRecords]
  );

  return (
    <div className="max-w-6xl space-y-6 lg:space-y-8">
      <section className="app-panel-strong p-6 lg:p-8">
        <p className="app-kicker">
          Boss Mode
        </p>
        <h1 className="app-page-title text-[2rem]">
          Sales Awaiting Approval
        </h1>
        <p className="app-page-subtitle">
                  This is your decision inbox. Review the sale, make the decision, and only open the
          deeper ERP page when you need the full commercial controls.
        </p>
      </section>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> to
          load live review data.
        </div>
      )}

      {loading && (
        <section className="app-panel p-5">
          <p className="text-sm text-zinc-500">Loading the decision inbox...</p>
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
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Pending Decisions
              </p>
              <p className="app-page-title text-[2rem]">
                {pendingSales.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Waiting for an approve or reject call
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Needs Changes
              </p>
              <p className="app-page-title text-[2rem]">
                {needsChangesSales.length}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Already sent back for another pass
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Decisions Recorded
              </p>
              <p className="app-page-title text-[2rem]">
                {decisionCount}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Saved in this lightweight approval layer
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Role Focus
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                Sellers work from My Sales. Managers work from this inbox.
              </p>
            </div>
          </section>

          <section className="app-panel-strong p-6 lg:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Decision Inbox
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Each card is a sale decision. Take action right here, then open the secondary
                  review page only if you need more context.
                </p>
              </div>
              <Link
                href="/admin/quote-versions"
                className="app-link text-sm"
              >
                Open advanced commercial records
              </Link>
            </div>

            {visibleSales.length === 0 ? (
              <div className="app-empty">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your decision inbox is clear.
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  New sales will appear here when they are ready for a manager decision.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {visibleSales.map((sale) => (
                  <EasySalesCard
                    key={sale.id}
                    sale={sale}
                    extraBadge={sale.seller || sale.stageLabel}
                    description={
                      sale.decisionComment
                        ? `Latest note: ${sale.decisionComment}`
                        : "Use the quick decisions here, or open the review page for more context."
                    }
                    actions={
                      <>
                        <QuickActionButton
                          label="Approve"
                          tone="primary"
                          onClick={() => applyDecision(sale, "approve")}
                        />
                        <QuickActionButton
                          label="Send back"
                          tone="warning"
                          onClick={() => applyDecision(sale, "send_back")}
                        />
                        <QuickActionButton
                          label="Reject"
                          tone="danger"
                          onClick={() => applyDecision(sale, "reject")}
                        />
                        <Link
                          href={sale.detailHref}
                          className="app-button-secondary !px-4 !py-2"
                        >
                          Open review
                        </Link>
                      </>
                    }
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

