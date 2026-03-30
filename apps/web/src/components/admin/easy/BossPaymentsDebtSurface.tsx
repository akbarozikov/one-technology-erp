"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import { useI18n } from "@/components/admin/LanguageProvider";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import {
  buildSales,
  type Sale,
  type SaleOrderLineRow,
  type SaleOrderRow,
  type SalePaymentRow,
  type SaleQuoteLineRow,
  type SaleQuoteRow,
  type SaleQuoteVersionRow,
} from "@/lib/easy-sales";
import {
  buildPaymentDebtItems,
  paymentDebtTone,
  type PaymentDebtItem,
  type RecentPaymentRow,
} from "@/lib/easy-payments";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function DebtCard({ item }: { item: PaymentDebtItem }) {
  const { adminText } = useI18n();
  return (
    <Link
      href={item.advancedHref}
      className="app-panel block p-4 transition duration-150 hover:-translate-y-0.5 hover:border-black/15 dark:hover:border-white/12"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.client}</div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.relatedSale}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${paymentDebtTone(item.status)}`}
        >
          {adminText(item.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {adminText("Total")}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatCurrency(item.totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {adminText("Paid")}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatCurrency(item.paidAmount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {adminText("Remaining")}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatCurrency(item.remainingAmount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {adminText("Due")}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {item.dueDate || "-"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function BossPaymentsDebtSurface() {
  const { hasAnyPermission } = useAuth();
  const { adminText, formatCurrency } = useI18n();
  const [items, setItems] = useState<PaymentDebtItem[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPaymentRow[]>([]);
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
        const [ordersRes, orderLinesRes, quotesRes, versionsRes, quoteLinesRes, paymentsRes] =
          await Promise.all([
            apiGet<{ data: SaleOrderRow[] }>("/api/orders"),
            apiGet<{ data: SaleOrderLineRow[] }>("/api/order-lines"),
            apiGet<{ data: SaleQuoteRow[] }>("/api/quotes"),
            apiGet<{ data: SaleQuoteVersionRow[] }>("/api/quote-versions"),
            apiGet<{ data: SaleQuoteLineRow[] }>("/api/quote-lines"),
            apiGet<{ data: SalePaymentRow[] }>("/api/payments"),
          ]);

        if (cancelled) return;

        const builtSales = buildSales({
          quotes: quotesRes.data ?? [],
          quoteVersions: versionsRes.data ?? [],
          quoteLines: quoteLinesRes.data ?? [],
          orders: ordersRes.data ?? [],
          orderLines: orderLinesRes.data ?? [],
        });
        setSales(builtSales);
        setItems(
          buildPaymentDebtItems({
            orders: ordersRes.data ?? [],
            sales: builtSales,
          })
        );
        setRecentPayments((paymentsRes.data ?? []).filter((payment) => payment.status !== "cancelled"));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : adminText("Failed to load payments and debt.")
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

  const outstanding = useMemo(
    () => items.filter((item) => item.status === "Outstanding" || item.status === "Needs attention"),
    [items]
  );
  const overdue = useMemo(() => items.filter((item) => item.status === "Overdue"), [items]);
  const partiallyPaid = useMemo(
    () => items.filter((item) => item.status === "Partially paid"),
    [items]
  );
  const highValueOutstanding = useMemo(
    () => [...items]
      .filter((item) => (item.remainingAmount ?? 0) > 0)
      .sort((a, b) => (b.remainingAmount ?? 0) - (a.remainingAmount ?? 0))
      .slice(0, 5),
    [items]
  );
  const paidRecently = useMemo(
    () =>
      recentPayments
        .slice()
        .sort((a, b) => String(b.payment_date ?? "").localeCompare(String(a.payment_date ?? "")))
        .slice(0, 5),
    [recentPayments]
  );
  const saleByOrderId = useMemo(() => {
    const map = new Map<number, Sale>();
    for (const sale of sales) {
      const orderIdMatch = sale.advancedHref.match(/\/admin\/orders\/(\d+)/);
      if (orderIdMatch) {
        map.set(Number(orderIdMatch[1]), sale);
      }
    }
    return map;
  }, [sales]);

  const outstandingTotal = useMemo(
    () => outstanding.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0),
    [outstanding]
  );
  const overdueTotal = useMemo(
    () => overdue.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0),
    [overdue]
  );
  const canReviewApprovals = hasAnyPermission(["approvals.review"]);
  const canViewSales = hasAnyPermission(["sales.view_all", "sales.view_own"]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="app-page-title text-[2rem]">
          {adminText("Payments & Debt")}
        </h1>
        <p className="app-page-subtitle">
          {adminText("A boss-facing money view for what is collected, what is still open, and what needs attention first.")}
        </p>
      </div>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {adminText("Set")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          {adminText("in")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      {loading && (
        <section className="app-panel p-5">
          <p className="text-sm text-zinc-500">{adminText("Loading payments and debt...")}</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Outstanding")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(outstandingTotal)}
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Overdue")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(overdueTotal)}
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Partially Paid")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {partiallyPaid.length}
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Paid Recently")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {paidRecently.length}
              </p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {adminText("Needs Attention")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {overdue.length + highValueOutstanding.length}
              </p>
            </div>
          </section>

          <section className="app-panel p-5 lg:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {adminText("Quick Actions")}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/payments"
                className="app-button-primary min-h-24 flex-col items-start !rounded-[1.2rem] !px-4 !py-4 text-left"
              >
                <div className="font-medium">{adminText("Open advanced payments")}</div>
                <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-700">
                  {adminText("Go to the detailed payment records when you need the full ERP screen.")}
                </p>
              </Link>
              {canViewSales && <Link
                href="/admin/orders"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Open orders")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Follow through on the sales that still have money open.")}
                </p>
              </Link>}
              {canReviewApprovals && <Link
                href="/admin/approvals"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Review approvals")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Check the sales pipeline before debt builds up.")}
                </p>
              </Link>}
              <Link
                href="/admin"
                className="app-panel-muted flex min-h-24 flex-col px-4 py-4 transition hover:-translate-y-0.5"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{adminText("Back to boss dashboard")}</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {adminText("Return to the wider control surface.")}
                </p>
              </Link>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Needs Attention Now")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("The biggest open amounts should get attention first.")}
              </p>
              <div className="mt-4 space-y-3">
                {highValueOutstanding.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No high-value outstanding items are standing out right now.")}
                  </p>
                ) : (
                  highValueOutstanding.map((item) => <DebtCard key={item.id} item={item} />)
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Overdue")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {adminText("Items still open well after the sale was created.")}
              </p>
              <div className="mt-4 space-y-3">
                {overdue.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("Nothing looks overdue by the current lightweight rule.")}
                  </p>
                ) : (
                  overdue.map((item) => <DebtCard key={item.id} item={item} />)
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Partially Paid")}
              </h2>
              <div className="mt-4 space-y-3">
                {partiallyPaid.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No partially paid sales are showing right now.")}
                  </p>
                ) : (
                  partiallyPaid.map((item) => <DebtCard key={item.id} item={item} />)
                )}
              </div>
            </section>

            <section className="app-panel p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {adminText("Paid Recently")}
              </h2>
              <div className="mt-4 space-y-3">
                {paidRecently.length === 0 ? (
                  <p className="app-page-subtitle">
                    {adminText("No recent payments are visible yet.")}
                  </p>
                ) : (
                  paidRecently.map((payment) => {
                    const sale = saleByOrderId.get(payment.order_id);
                    return (
                      <Link
                        key={payment.id}
                        href={sale?.advancedHref || `/admin/orders/${payment.order_id}`}
                        className="block rounded border border-zinc-200 px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {sale?.client || `${adminText("Client")} ${payment.order_id}`}
                            </div>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              {sale?.product || `${adminText("Order")} ${payment.order_id}`}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                            {adminText("Paid")}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              {adminText("Amount")}
                            </p>
                            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                              {payment.amount === null ? "-" : formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              {adminText("Date")}
                            </p>
                            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                              {payment.payment_date || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              {adminText("Reference")}
                            </p>
                            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                              {payment.reference_number || "-"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          </section>
        </>
      )}
    </div>
  );
}

