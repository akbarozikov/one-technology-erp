"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  EasyWorkspaceLive,
  type EasyWorkspaceData,
} from "@/components/admin/easy/EasyWorkspaceLive";

type OrderRow = {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  order_date: string | null;
};

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
};

async function loadMySalesData(): Promise<EasyWorkspaceData> {
  const [ordersRes, versionsRes] = await Promise.all([
    apiGet<{ data: OrderRow[] }>("/api/orders"),
    apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
  ]);

  const orders = ordersRes.data ?? [];
  const versions = versionsRes.data ?? [];

  const openOrders = orders.filter(
    (order) => order.order_status !== "completed" && order.order_status !== "cancelled"
  );
  const paymentOpen = orders.filter(
    (order) => order.payment_status === "unpaid" || order.payment_status === "partially_paid"
  );

  return {
    stats: [
      {
        label: "Open Orders",
        value: openOrders.length,
        hint: `${orders.length} total orders`,
      },
      {
        label: "Payment Follow-up",
        value: paymentOpen.length,
        hint: "Orders that still need payment attention",
      },
      {
        label: "Prepared Versions",
        value: versions.filter((version) =>
          ["prepared", "sent", "accepted"].includes(version.version_status)
        ).length,
        hint: "Commercial versions still in motion",
      },
      {
        label: "Completed Orders",
        value: orders.filter((order) => order.order_status === "completed").length,
        hint: "Closed commercial follow-through",
      },
    ],
    activityTitle: "Recent Sales Activity",
    activityLinkHref: "/admin/orders",
    activityLinkLabel: "Open orders",
    activityItems: [
      ...orders.slice(0, 4).map((order) => ({
        href: `/admin/orders/${order.id}`,
        title: order.order_number || `Order ${order.id}`,
        meta: `${order.order_status} · ${order.payment_status}`,
        description: order.order_date ? `Order date: ${order.order_date}` : "Customer order",
      })),
      ...versions.slice(0, 2).map((version) => ({
        href: `/admin/quote-versions/${version.id}`,
        title: `Quote ${version.quote_id} · Version ${version.version_number}`,
        meta: version.version_status,
        description: "Continue proposal work or move this version into an order.",
      })),
    ],
    activityEmptyMessage: "No sales activity has been recorded yet.",
  };
}

export default function MySalesPage() {
  const loadData = useCallback(() => loadMySalesData(), []);

  return (
    <EasyWorkspaceLive
      title="My Sales"
      summary="Track the commercial records that still need attention without browsing raw entity pages."
      description="Use this surface to stay close to quotes moving toward orders, orders waiting on payment, and the latest sales records that need follow-through."
      actions={[
        {
          href: "/admin/orders",
          label: "Open Orders",
          description: "Review active orders and continue payment or fulfillment follow-through.",
          primary: true,
        },
        {
          href: "/admin/quote-versions",
          label: "Open Quote Versions",
          description: "Continue proposal work or convert a version into an order.",
        },
        {
          href: "/admin/payments",
          label: "Open Payments",
          description: "Review recorded payments and unfinished payment follow-up.",
        },
      ]}
      snapshotTitle="Sales Snapshot"
      activityTitle="Recent Sales Activity"
      loadData={loadData}
    />
  );
}
