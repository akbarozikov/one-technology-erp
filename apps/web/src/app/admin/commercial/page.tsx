"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  DomainLandingLive,
  type DomainLandingInsights,
} from "@/components/admin/domain/DomainLandingLive";

type QuoteRow = {
  id: number;
  quote_number: string;
  status: string;
};

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
};

type OrderRow = {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  order_date: string | null;
};

type PaymentRow = {
  id: number;
  amount: number | null;
  status: string;
  payment_date: string | null;
};

async function loadCommercialInsights(): Promise<DomainLandingInsights> {
  const [quotesRes, versionsRes, ordersRes, paymentsRes] = await Promise.all([
    apiGet<{ data: QuoteRow[] }>("/api/quotes"),
    apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
    apiGet<{ data: OrderRow[] }>("/api/orders"),
    apiGet<{ data: PaymentRow[] }>("/api/payments"),
  ]);

  const quotes = quotesRes.data ?? [];
  const quoteVersions = versionsRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const payments = paymentsRes.data ?? [];

  const recordedPayments = payments.filter((payment) => payment.status === "recorded");
  const paymentTotal = recordedPayments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0
  );

  return {
    stats: [
      {
        label: "Quotes",
        value: quotes.length,
        hint: `${quotes.filter((quote) => quote.status === "draft").length} draft`,
      },
      {
        label: "Quote Versions",
        value: quoteVersions.length,
        hint: `${quoteVersions.filter((version) => version.version_status === "approved").length} approved`,
      },
      {
        label: "Orders",
        value: orders.length,
        hint: `${orders.filter((order) => order.order_status === "draft").length} draft`,
      },
      {
        label: "Recorded Payments",
        value: recordedPayments.length,
        hint: paymentTotal > 0 ? paymentTotal.toFixed(2) : "0.00",
      },
    ],
    activityTitle: "Recent Quotes and Orders",
    activityLinkHref: "/admin/orders",
    activityLinkLabel: "Open orders",
    activityItems: [
      ...orders.slice(0, 3).map((order) => ({
        href: `/admin/orders/${order.id}`,
        title: order.order_number || `Order ${order.id}`,
        meta: `Order · ${order.order_status} · ${order.payment_status}`,
        description: order.order_date ? `Order date: ${order.order_date}` : "Order record",
      })),
      ...quoteVersions.slice(0, 3).map((version) => ({
        href: `/admin/quote-versions/${version.id}`,
        title: `Quote ${version.quote_id} · V${version.version_number}`,
        meta: `Quote Version · ${version.version_status}`,
        description: "Open the quote version to review revisions or generate proposal documents.",
      })),
    ],
    activityEmptyMessage: "No recent quotes or orders yet.",
  };
}

export default function CommercialLandingPage() {
  const loadData = useCallback(() => loadCommercialInsights(), []);

  return (
    <DomainLandingLive
      title="Commercial"
      summary="Work with quotes, orders, payments, and the commercial records that move deals toward fulfillment."
      description="Use this area for sales-side documents and commercial history. Start with quotes and orders, then move into payments or supporting line-level records when you need more detail."
      links={[
        {
          href: "/admin/quotes",
          label: "Quotes",
          description: "Create and review quote headers for active deal work.",
        },
        {
          href: "/admin/quote-versions",
          label: "Quote Versions",
          description: "Track revisions and generate commercial proposal documents.",
        },
        {
          href: "/admin/orders",
          label: "Orders",
          description: "Manage confirmed commercial commitments and downstream fulfillment context.",
        },
        {
          href: "/admin/payments",
          label: "Payments",
          description: "Record incoming payments and review order payment progress.",
        },
      ]}
      loadData={loadData}
    />
  );
}
