"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, apiPost, formatApiError, getApiBaseUrl } from "@/lib/api";
import { DocumentGenerationPanel } from "@/components/admin/DocumentGenerationPanel";
import {
  ActionGroup,
  AttentionList,
  DetailSection,
  RelatedList,
  SummaryGrid,
} from "@/components/admin/detail/DetailPrimitives";

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
  reservation_status: string;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  notes: string | null;
};

type QuoteRow = {
  id: number;
  quote_number: string;
  status: string;
  valid_until: string | null;
  notes: string | null;
};

type OrderRow = {
  id: number;
  quote_version_id: number | null;
  order_number: string;
  order_status: string;
  payment_status: string;
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

export default function QuoteVersionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [quoteVersion, setQuoteVersion] = useState<QuoteVersionRow | null>(null);
  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [linkedOrder, setLinkedOrder] = useState<OrderRow | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderActionError, setOrderActionError] = useState<string | null>(null);
  const [orderActionSuccess, setOrderActionSuccess] = useState<OrderRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid quote version id.");
        setLoading(false);
        return;
      }

      try {
        const [versionsRes, quotesRes, ordersRes, docsRes] = await Promise.all([
          apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
          apiGet<{ data: QuoteRow[] }>("/api/quotes"),
          apiGet<{ data: OrderRow[] }>("/api/orders"),
          apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
        ]);

        if (cancelled) return;

        const foundVersion = (versionsRes.data ?? []).find((row) => row.id === id) ?? null;
        if (!foundVersion) {
          setError(`Quote version ${id} not found.`);
          setQuoteVersion(null);
          setQuote(null);
          setLinkedOrder(null);
          setDocuments([]);
          return;
        }

        setQuoteVersion(foundVersion);
        setQuote((quotesRes.data ?? []).find((row) => row.id === foundVersion.quote_id) ?? null);
        setLinkedOrder(
          (ordersRes.data ?? []).find((row) => row.quote_version_id === foundVersion.id) ?? null
        );
        setDocuments(
          (docsRes.data ?? []).filter(
            (document) =>
              document.entity_type === "quote_version" && document.entity_id === foundVersion.id
          )
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load quote version details."
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

  const relatedDocumentItems = useMemo(
    () =>
      documents.slice(0, 5).map((document) => ({
        key: document.id,
        href: `/admin/generated-documents/${document.id}`,
        title:
          document.title || document.document_number || `Generated Document ${document.id}`,
        meta: `${document.generation_status} · ${document.generated_at ?? "-"}`,
        description: "Open the generated commercial proposal preview.",
      })),
    [documents]
  );

  const attentionItems = useMemo(() => {
    if (!quoteVersion) return [];

    const items: Array<{ key: string; title: string; description: string }> = [];

    if (documents.length === 0) {
      items.push({
        key: "proposal",
        title: "Proposal document has not been generated yet",
        description:
          "Generate a commercial proposal when this version is ready to be shared or stored as a formal quote snapshot.",
      });
    }

    if (!linkedOrder) {
      items.push({
        key: "order-draft",
        title: "No linked order exists yet",
        description:
          "If this version is approved for follow-through, creating an order draft is the clearest next commercial step.",
      });
    } else {
      items.push({
        key: "linked-order",
        title: "Workflow can continue in the linked order",
        description:
          "This quote version already has an order draft, so payment and fulfillment work can continue from that order page.",
      });
    }

    return items;
  }, [documents.length, linkedOrder, quoteVersion]);

  async function handleCreateOrderDraft() {
    if (creatingOrder || !quoteVersion) return;

    setCreatingOrder(true);
    setOrderActionError(null);
    setOrderActionSuccess(null);

    try {
      const response = await apiPost<{
        data?: { order?: OrderRow | null } | null;
      }>(`/api/quote-versions/${quoteVersion.id}/create-order-draft`, {});

      const createdOrder = response.data?.order ?? null;
      setOrderActionSuccess(createdOrder);
      if (createdOrder) {
        setLinkedOrder(createdOrder);
      }
    } catch (err) {
      setOrderActionError(
        err instanceof ApiError
          ? formatApiError(err)
          : err instanceof Error
            ? err.message
            : "Failed to create order draft"
      );
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quote Version Workflow
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review proposal context, generate documents, and move cleanly toward order creation.
          </p>
        </div>
        <Link
          href="/admin/quote-versions"
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
          <p className="text-sm text-zinc-500">Loading quote version details...</p>
        </DetailSection>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && quoteVersion && (
        <>
          <DetailSection
            title={`${quote?.quote_number ?? `Quote ${quoteVersion.quote_id}`} · Version ${quoteVersion.version_number}`}
            description="Current quote revision, pricing snapshot, and next-step commercial context."
          >
            <SummaryGrid
              items={[
                { label: "Version Status", value: quoteVersion.version_status },
                { label: "Quote Status", value: quote?.status ?? "-" },
                { label: "Valid Until", value: quote?.valid_until ?? "-" },
                { label: "Reservation Status", value: quoteVersion.reservation_status },
                { label: "Minimum Total", value: money(quoteVersion.minimum_sale_total) },
                { label: "Actual Total", value: money(quoteVersion.actual_sale_total) },
                { label: "Discount Total", value: money(quoteVersion.discount_total) },
                { label: "Grand Total", value: money(quoteVersion.grand_total) },
              ]}
            />
          </DetailSection>

          <DetailSection
            title="Next Steps"
            description="Lightweight guidance based on the current quote-version state."
          >
            <AttentionList items={attentionItems} />
          </DetailSection>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <DetailSection
              title="Key Actions"
              description="Generate a proposal document here, or create the first order draft when this version is ready to move forward."
            >
              <div className="mb-4 space-y-4">
                <ActionGroup
                  title="Primary Actions"
                  description="These are the most likely next commercial steps from this quote version."
                  items={[
                    {
                      key: "create-order",
                      label: creatingOrder
                        ? "Creating order..."
                        : linkedOrder
                          ? "Order Already Exists"
                          : "Create Order Draft",
                      onClick: handleCreateOrderDraft,
                      disabled: creatingOrder || linkedOrder !== null,
                      primary: true,
                      helperText: linkedOrder
                        ? "This quote version already has a linked order."
                        : "Create a draft order without manually re-entering the quote version details.",
                    },
                  ]}
                />
                <ActionGroup
                  title="Supporting Actions"
                  description="Open the surrounding commercial records when you need more context."
                  items={[
                    {
                      key: "quotes",
                      label: "Open Quotes",
                      href: "/admin/quotes",
                      helperText: "Review the quote header and earlier commercial context.",
                    },
                    {
                      key: "orders",
                      label: "Open Orders",
                      href: "/admin/orders",
                      helperText: "Move into downstream order follow-through when an order exists.",
                    },
                  ]}
                />
              </div>

              {orderActionError && (
                <pre
                  className="mb-4 whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                  role="alert"
                >
                  {orderActionError}
                </pre>
              )}

              {orderActionSuccess && (
                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  <p>Order draft created successfully.</p>
                  <Link
                    href={`/admin/orders/${orderActionSuccess.id}`}
                    className="mt-2 inline-block text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Open order {orderActionSuccess.order_number}
                  </Link>
                </div>
              )}

              <DocumentGenerationPanel
                entityLabel="Quote Version"
                entityListPath="/api/quote-versions"
                entityId={id}
                generatePath={`/api/quote-versions/${id}/generate-document`}
                summaryFields={[
                  { key: "id", label: "ID" },
                  { key: "quote_id", label: "Quote ID" },
                  { key: "version_number", label: "Version Number" },
                  { key: "version_status", label: "Version Status" },
                  { key: "reservation_status", label: "Reservation Status" },
                  { key: "grand_total", label: "Grand Total" },
                  { key: "created_at", label: "Created At" },
                ]}
                templateTypes={["quote"]}
                templateEntityType="quote_version"
                showSummary={false}
                showConfigHint={false}
                panelTitle="Generate Commercial Proposal"
                panelDescription="Use an active quote template to create a stored proposal document snapshot from this version."
              />
            </DetailSection>

            <div className="space-y-6">
              <DetailSection title="Linked Order" description="Order follow-through derived from this quote version when present.">
                {linkedOrder ? (
                  <RelatedList
                    items={[
                      {
                        key: linkedOrder.id,
                        href: `/admin/orders/${linkedOrder.id}`,
                        title: linkedOrder.order_number,
                        meta: `${linkedOrder.order_status} · ${linkedOrder.payment_status}`,
                        description: "Open the linked order workflow page.",
                      },
                    ]}
                    emptyMessage=""
                  />
                ) : (
                  <RelatedList
                    items={[]}
                    emptyMessage="No order draft has been created from this quote version yet."
                    emptyAction={
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Use the primary action above when this version is ready to move into order follow-through.
                      </p>
                    }
                  />
                )}
              </DetailSection>

              <DetailSection
                title="Generated Documents"
                description="Recent proposal documents created from this version."
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
                  emptyMessage="No generated documents are linked directly to this quote version yet."
                  emptyAction={
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Generate a commercial proposal from the action area on this page.
                    </p>
                  }
                />
              </DetailSection>
            </div>
          </div>

          {(quoteVersion.notes || quote?.notes) && (
            <DetailSection title="Notes" description="Stored context from the quote and this specific version.">
              <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                {quoteVersion.notes && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Version Notes
                    </p>
                    <p>{quoteVersion.notes}</p>
                  </div>
                )}
                {quote?.notes && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Quote Notes
                    </p>
                    <p>{quote.notes}</p>
                  </div>
                )}
              </div>
            </DetailSection>
          )}
        </>
      )}
    </div>
  );
}
