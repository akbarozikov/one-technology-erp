"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  EasyWorkspaceLive,
  type EasyWorkspaceData,
} from "@/components/admin/easy/EasyWorkspaceLive";

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
};

type GeneratedDocumentRow = {
  id: number;
  title: string | null;
  document_number: string | null;
  generation_status: string;
};

async function loadApprovalData(): Promise<EasyWorkspaceData> {
  const [versionsRes, ordersRes, documentsRes] = await Promise.all([
    apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
    apiGet<{ data: OrderRow[] }>("/api/orders"),
    apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
  ]);

  const versions = versionsRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const documents = documentsRes.data ?? [];

  const commercialReview = versions.filter((version) =>
    ["prepared", "sent"].includes(version.version_status)
  );
  const paymentAttention = orders.filter((order) => order.payment_status === "unpaid");
  const failedDocuments = documents.filter((document) => document.generation_status === "failed");

  return {
    stats: [
      {
        label: "Quote Review",
        value: commercialReview.length,
        hint: "Prepared or sent versions to review",
      },
      {
        label: "Payment Attention",
        value: paymentAttention.length,
        hint: "Orders still marked unpaid",
      },
      {
        label: "Failed Documents",
        value: failedDocuments.length,
        hint: "Document records that may need another try",
      },
      {
        label: "Completed Orders",
        value: orders.filter((order) => order.order_status === "completed").length,
        hint: "Already closed out",
      },
    ],
    activityTitle: "Items Needing Review",
    activityLinkHref: "/admin/quote-versions",
    activityLinkLabel: "Open quote versions",
    activityItems: [
      ...commercialReview.slice(0, 3).map((version) => ({
        href: `/admin/quote-versions/${version.id}`,
        title: `Quote ${version.quote_id} · Version ${version.version_number}`,
        meta: version.version_status,
        description: "Review the proposal state and decide whether it should move forward.",
      })),
      ...paymentAttention.slice(0, 2).map((order) => ({
        href: `/admin/orders/${order.id}`,
        title: order.order_number || `Order ${order.id}`,
        meta: `${order.order_status} · ${order.payment_status}`,
        description: "Check payment follow-through before the order moves further.",
      })),
      ...failedDocuments.slice(0, 1).map((document) => ({
        href: "/admin/generated-documents",
        title: document.title || document.document_number || `Generated Document ${document.id}`,
        meta: document.generation_status,
        description: "Review the document record and decide whether it should be regenerated.",
      })),
    ],
    activityEmptyMessage:
      "Nothing obvious needs review right now. This lightweight queue stays manual in V1.",
  };
}

export default function ApprovalsPage() {
  const loadData = useCallback(() => loadApprovalData(), []);

  return (
    <EasyWorkspaceLive
      title="Approvals"
      summary="A simple working queue for records that look ready for review, follow-up, or a next commercial decision."
      description="This is not a full approval engine yet. It is a lighter workspace that helps sellers and managers spot prepared quote versions, unpaid orders, and document records that may need attention."
      actions={[
        {
          href: "/admin/quote-versions",
          label: "Review Quote Versions",
          description: "Open prepared or sent versions that may be ready for the next commercial decision.",
          primary: true,
        },
        {
          href: "/admin/orders",
          label: "Review Orders",
          description: "Check orders that still need payment or completion follow-through.",
        },
        {
          href: "/admin/generated-documents",
          label: "Review Documents",
          description: "Look at recent generated or failed document records.",
        },
      ]}
      snapshotTitle="Review Snapshot"
      activityTitle="Items Needing Review"
      footerNote={
        <>
          A deeper approval engine can wait for V2. For now, this page gives normal users a clearer
          coordination surface without exposing the whole ERP.
        </>
      }
      loadData={loadData}
    />
  );
}
