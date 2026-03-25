"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  getEasyApprovalRecord,
  loadEasyApprovalRecords,
  saveEasyApprovalRecord,
  type EasyApprovalDecision,
} from "@/lib/easy-approvals";

type QuoteLineDetailRow = SaleQuoteLineRow & {
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
  snapshot_description: string | null;
};

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>();
  const saleId = Number(params.id);

  const [sale, setSale] = useState<Sale | null>(null);
  const [lineDetails, setLineDetails] = useState<QuoteLineDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);
  const [decision, setDecision] = useState<EasyApprovalDecision>("approve");
  const [comment, setComment] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(saleId) || saleId <= 0) {
      setLoading(false);
      setError("Invalid sale id.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSavedMessage(null);
      setConfigHint(!getApiBaseUrl());

      try {
        const [versionsRes, quotesRes, quoteLinesRes, ordersRes, orderLinesRes, usersRes] =
          await Promise.all([
            apiGet<{ data: SaleQuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: SaleQuoteRow[] }>("/api/quotes"),
            apiGet<{ data: QuoteLineDetailRow[] }>("/api/quote-lines"),
            apiGet<{ data: SaleOrderRow[] }>("/api/orders"),
            apiGet<{ data: SaleOrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: SaleUserRow[] }>("/api/users"),
          ]);

        if (cancelled) return;

        const approvalRecords = loadEasyApprovalRecords();
        const builtSales = buildSales({
          quotes: quotesRes.data ?? [],
          quoteVersions: versionsRes.data ?? [],
          quoteLines: quoteLinesRes.data ?? [],
          orders: ordersRes.data ?? [],
          orderLines: orderLinesRes.data ?? [],
          users: usersRes.data ?? [],
          approvalRecords,
        });
        const currentSale = builtSales.find((item) => item.id === saleId) ?? null;

        if (!currentSale) {
          setSale(null);
          setError("Sale not found.");
          setLineDetails([]);
          return;
        }

        const saved = getEasyApprovalRecord(currentSale.id);
        setDecision(saved?.decision ?? "approve");
        setComment(saved?.comment ?? "");
        setSale(currentSale);
        setLineDetails((quoteLinesRes.data ?? []).filter((item) => item.quote_version_id === saleId));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load this sale review."
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
  }, [saleId]);

  const existingDecision = sale ? getEasyApprovalRecord(sale.id) : null;

  function saveDecision() {
    if (!sale) return;
    saveEasyApprovalRecord(sale.id, {
      decision,
      comment: comment.trim(),
      savedAt: new Date().toISOString(),
    });
    setSale((current) =>
      current
        ? {
            ...current,
            decision,
            decisionComment: comment.trim() || null,
            status:
              decision === "approve"
                ? "Approved"
                : decision === "send_back"
                  ? "Needs changes"
                  : "Rejected",
          }
        : current
    );
    setSavedMessage(
      "Decision saved. Continue in the advanced sales page only when you need the deeper ERP workflow."
    );
  }

  return (
    <div className="max-w-5xl space-y-6 lg:space-y-8">
      <section className="app-panel-strong p-6 lg:p-8">
        <p className="app-kicker">
          Boss Mode
        </p>
        <h1 className="app-page-title text-[2rem]">
          Review Sale
        </h1>
        <p className="app-page-subtitle">
          Use this secondary view when you want a little more context before making or adjusting a
          decision.
        </p>
      </section>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> to
          load live sales review data.
        </div>
      )}

      {loading && (
        <section className="app-panel p-5">
          <p className="text-sm text-zinc-500">Loading this sale review...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && sale && (
        <>
          <EasySalesCard
            sale={sale}
            extraBadge={sale.seller || sale.stageLabel}
            description={
              sale.decisionComment
                ? `Latest note: ${sale.decisionComment}`
                : "This view stays lightweight on purpose. Use the advanced page only if you need deeper commercial controls."
            }
          />

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="app-panel-strong p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Decision
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Keep the decision clear and short. The seller should be able to understand the next
                step immediately.
              </p>

              {existingDecision && (
                <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  Current decision: {existingDecision.decision.replace("_", " ")}
                  {existingDecision.comment ? ` - ${existingDecision.comment}` : ""}
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {([
                  ["approve", "Approve"],
                  ["send_back", "Send Back"],
                  ["reject", "Reject"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDecision(value)}
                    className={`rounded border px-3 py-2 text-left text-sm ${
                      decision === value
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                  Comment
                </span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  className="app-input"
                  placeholder="Explain the decision or tell the seller what to change"
                />
              </label>

              {savedMessage && (
                <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  {savedMessage}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveDecision}
                  className="app-button-primary"
                >
                  Save Decision
                </button>
                <Link
                  href={sale.advancedHref}
                  className="app-button-secondary"
                >
                  Open advanced sales page
                </Link>
              </div>
            </section>

            <section className="app-panel-strong p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                What You Are Reviewing
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                This gives you just enough context to decide without dropping back into the raw ERP.
              </p>

              {lineDetails.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                  No additional sale items are visible here. Open the advanced sales page if you
                  need the full commercial structure.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {lineDetails.slice(0, 3).map((line) => (
                    <div
                      key={line.id}
                      className="app-panel-muted px-4 py-4"
                    >
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {line.snapshot_product_name || "Sale item"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Quantity: {line.quantity ?? "-"} | Price: {line.unit_price ?? "-"} | Total:{" "}
                        {line.line_total ?? "-"}
                      </p>
                      {line.snapshot_description && (
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {line.snapshot_description}
                        </p>
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

