"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";
import { DocumentGenerationPanel } from "@/components/admin/DocumentGenerationPanel";
import {
  ActionGroup,
  AttentionList,
  DetailSection,
  RelatedList,
  SummaryGrid,
} from "@/components/admin/detail/DetailPrimitives";

type OrderRow = {
  id: number;
  quote_version_id: number | null;
  order_number: string;
  order_status: string;
  payment_status: string;
  reservation_status: string;
  fulfillment_type: string;
  installation_required: number;
  order_date: string | null;
  grand_total: number | null;
  paid_total: number | null;
  remaining_total: number | null;
  notes: string | null;
};

type PaymentRow = {
  id: number;
  order_id: number;
  amount: number | null;
  currency: string | null;
  status: string;
  payment_date: string | null;
  reference_number: string | null;
};

type QuoteVersionRow = {
  id: number;
  version_number: number;
  version_status: string;
};

type GeneratedDocumentRow = {
  id: number;
  entity_type: string;
  entity_id: number;
  title: string | null;
  document_number: string | null;
  generation_status: string;
  generated_at: string | null;
};

function money(value: number | null): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(2);
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocumentRow[]>([]);
  const [linkedQuoteVersion, setLinkedQuoteVersion] = useState<QuoteVersionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid order id.");
        setLoading(false);
        return;
      }

      try {
        const [ordersRes, paymentsRes, docsRes, quoteVersionsRes] = await Promise.all([
          apiGet<{ data: OrderRow[] }>("/api/orders"),
          apiGet<{ data: PaymentRow[] }>("/api/payments"),
          apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
          apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
        ]);

        if (cancelled) return;

        const foundOrder = (ordersRes.data ?? []).find((row) => row.id === id) ?? null;
        if (!foundOrder) {
          setError(`Order ${id} not found.`);
          setOrder(null);
          setPayments([]);
          setDocuments([]);
          setLinkedQuoteVersion(null);
          return;
        }

        setOrder(foundOrder);
        setPayments((paymentsRes.data ?? []).filter((payment) => payment.order_id === id));
        setDocuments(
          (docsRes.data ?? []).filter(
            (document) => document.entity_type === "order" && document.entity_id === id
          )
        );
        setLinkedQuoteVersion(
          foundOrder.quote_version_id === null
            ? null
            : (quoteVersionsRes.data ?? []).find(
                (row) => row.id === foundOrder.quote_version_id
              ) ?? null
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load order details."
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
  }, [id]);

  const recentPaymentItems = useMemo(
    () =>
      payments.slice(0, 5).map((payment) => ({
        key: payment.id,
        title: payment.reference_number || `Payment ${payment.id}`,
        meta: `${payment.status} · ${money(payment.amount)} ${payment.currency ?? ""}`.trim(),
        description: payment.payment_date
          ? `Payment date: ${payment.payment_date}`
          : "Recorded payment",
      })),
    [payments]
  );

  const relatedDocumentItems = useMemo(
    () =>
      documents.slice(0, 5).map((document) => ({
        key: document.id,
        href: `/admin/generated-documents/${document.id}`,
        title:
          document.title || document.document_number || `Generated Document ${document.id}`,
        meta: `${document.generation_status} · ${document.generated_at ?? "-"}`,
        description: "Open the generated order document preview.",
      })),
    [documents]
  );

  const attentionItems = useMemo(() => {
    if (!order) return [];

    const items: Array<{ key: string; title: string; description: string }> = [];

    if (order.payment_status === "unpaid" || order.payment_status === "partially_paid") {
      items.push({
        key: "payment",
        title: "Payment follow-through is still open",
        description:
          order.remaining_total && order.remaining_total > 0
            ? `There is still ${money(order.remaining_total)} remaining on this order, so recording a payment is likely the next business step.`
            : "Payment status is not closed yet, so review recorded payments and add a payment if needed.",
      });
    }

    if (documents.length === 0) {
      items.push({
        key: "document",
        title: "No order document has been generated yet",
        description:
          "Generate an order document when this record is ready to be shared or stored as a formal commercial snapshot.",
      });
    }

    if (order.reservation_status === "none") {
      items.push({
        key: "fulfillment",
        title: "Operational fulfillment context still looks early",
        description:
          "This order does not show reservation progress yet, so review order lines and warehouse follow-through before operational execution.",
      });
    }

    return items;
  }, [documents.length, order]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Order Workflow
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            See where the order stands, what still needs attention, and what to do next.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to list
        </Link>
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
        <DetailSection title="Loading">
          <p className="text-sm text-zinc-500">Loading order details...</p>
        </DetailSection>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && order && (
        <>
          <DetailSection
            title={order.order_number || `Order ${order.id}`}
            description="A quick summary of order status, payment progress, and fulfillment context."
          >
            <SummaryGrid
              items={[
                {
                  label: "Source Quote Version",
                  value: linkedQuoteVersion ? `Version ${linkedQuoteVersion.version_number}` : "-",
                  hint: linkedQuoteVersion?.version_status ?? undefined,
                },
                { label: "Order Status", value: order.order_status },
                { label: "Payment Status", value: order.payment_status },
                { label: "Reservation Status", value: order.reservation_status },
                {
                  label: "Fulfillment Type",
                  value: order.fulfillment_type,
                  hint: order.installation_required === 1 ? "Installation required" : "No installation required",
                },
                { label: "Order Date", value: order.order_date || "-" },
                { label: "Grand Total", value: money(order.grand_total) },
                { label: "Paid Total", value: money(order.paid_total) },
                { label: "Remaining Total", value: money(order.remaining_total) },
              ]}
            />
          </DetailSection>

          <DetailSection
            title="Next Steps"
            description="A few simple cues based on the current state of this order."
          >
            <AttentionList items={attentionItems} />
          </DetailSection>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <DetailSection
              title="Key Actions"
              description="Use these actions when you need to capture payment progress or create an order document."
            >
              <div className="mb-4 space-y-4">
                <ActionGroup
                  title="Primary Actions"
                  description="Start here for the most common follow-up on an active order."
                  items={[
                    {
                      key: "payments",
                      label: "Review Payments",
                      href: "/admin/payments",
                      primary: true,
                      helperText:
                        order.payment_status === "unpaid" || order.payment_status === "partially_paid"
                          ? "Payment follow-through is still open on this order."
                          : "Payments are already underway, but you can still review or add records.",
                    },
                  ]}
                />
                <ActionGroup
                  title="Supporting Actions"
                  description="Use these links when you need more order detail or supporting records."
                  items={[
                    {
                      key: "order-lines",
                      label: "Open Order Lines",
                      href: "/admin/order-lines",
                      helperText: "Review fulfillment context and line-level progress.",
                    },
                    {
                      key: "documents",
                      label: "Open Documents",
                      href: "/admin/generated-documents",
                      helperText: "Review generated order documents and other stored document records.",
                    },
                  ]}
                />
              </div>
              <DocumentGenerationPanel
                entityLabel="Order"
                entityListPath="/api/orders"
                entityId={id}
                generatePath={`/api/orders/${id}/generate-document`}
                summaryFields={[
                  { key: "id", label: "ID" },
                  { key: "order_number", label: "Order Number" },
                  { key: "order_status", label: "Order Status" },
                  { key: "payment_status", label: "Payment Status" },
                  { key: "fulfillment_type", label: "Fulfillment Type" },
                  { key: "grand_total", label: "Grand Total" },
                  { key: "order_date", label: "Order Date" },
                ]}
                templateTypes={["order"]}
                templateEntityType="order"
                showSummary={false}
                showConfigHint={false}
                panelTitle="Generate Order Document"
                panelDescription="Use an active order template to create a stored HTML document snapshot from this order."
              />
            </DetailSection>

            <div className="space-y-6">
              <DetailSection
                title="Commercial Source"
                description="The quote version this order came from, when one is linked."
              >
                {linkedQuoteVersion ? (
                  <RelatedList
                    items={[
                      {
                        key: linkedQuoteVersion.id,
                        href: `/admin/quote-versions/${linkedQuoteVersion.id}`,
                        title: `Version ${linkedQuoteVersion.version_number}`,
                        meta: linkedQuoteVersion.version_status,
                        description: "Open the originating quote-version workflow page.",
                      },
                    ]}
                    emptyMessage=""
                  />
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This order is not linked to a quote version.
                  </p>
                )}
              </DetailSection>

              <DetailSection
                title="Recent Payments"
                description="The latest payment records linked to this order."
                action={
                  <Link
                    href="/admin/payments"
                    className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    View all
                  </Link>
                }
              >
                <RelatedList
                  items={recentPaymentItems}
                  emptyMessage="No payments have been recorded for this order yet."
                  emptyAction={
                    <Link
                      href="/admin/payments"
                      className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Record or review payments
                    </Link>
                  }
                />
              </DetailSection>

              <DetailSection
                title="Generated Documents"
                description="Saved document outputs created from this order."
                action={
                  <Link
                    href="/admin/generated-documents"
                    className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    View all
                  </Link>
                }
              >
                <RelatedList
                  items={relatedDocumentItems}
                  emptyMessage="No generated documents are linked directly to this order yet."
                  emptyAction={
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Use the document section on this page to create the first order document.
                    </p>
                  }
                />
              </DetailSection>
            </div>
          </div>

          {order.notes && (
            <DetailSection title="Notes" description="Extra context saved on the order record.">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{order.notes}</p>
            </DetailSection>
          )}
        </>
      )}
    </div>
  );
}
