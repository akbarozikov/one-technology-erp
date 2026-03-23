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

type InstallationJobRow = {
  id: number;
  order_id: number | null;
  order_line_id: number | null;
  job_number: string;
  job_type: string;
  job_status: string;
  planned_date: string | null;
  actual_completed_at: string | null;
  address_text: string | null;
  city: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
};

type InstallationResultRow = {
  id: number;
  installation_job_id: number;
  result_status: string;
  completion_date: string | null;
  work_summary: string | null;
  followup_required: number;
  followup_notes: string | null;
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

type OrderRow = {
  id: number;
  order_number: string;
  order_status: string;
};

export default function InstallationJobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [job, setJob] = useState<InstallationJobRow | null>(null);
  const [results, setResults] = useState<InstallationResultRow[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocumentRow[]>([]);
  const [linkedOrder, setLinkedOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);
  const [resultDraftState, setResultDraftState] = useState<{
    loading: boolean;
    error: string | null;
    successId: number | null;
  }>({ loading: false, error: null, successId: null });
  const [completionState, setCompletionState] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({ loading: false, error: null, success: false });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid installation job id.");
        setLoading(false);
        return;
      }

      try {
        const [jobsRes, resultsRes, docsRes, ordersRes] = await Promise.all([
          apiGet<{ data: InstallationJobRow[] }>("/api/installation-jobs"),
          apiGet<{ data: InstallationResultRow[] }>("/api/installation-results"),
          apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
          apiGet<{ data: OrderRow[] }>("/api/orders"),
        ]);

        if (cancelled) return;

        const foundJob = (jobsRes.data ?? []).find((row) => row.id === id) ?? null;
        if (!foundJob) {
          setError(`Installation job ${id} not found.`);
          setJob(null);
          setResults([]);
          setDocuments([]);
          setLinkedOrder(null);
          return;
        }

        setJob(foundJob);
        setResults(
          (resultsRes.data ?? []).filter((result) => result.installation_job_id === foundJob.id)
        );
        setDocuments(
          (docsRes.data ?? []).filter(
            (document) =>
              document.entity_type === "installation_job" &&
              document.entity_id === foundJob.id
          )
        );
        setLinkedOrder(
          foundJob.order_id === null
            ? null
            : (ordersRes.data ?? []).find((row) => row.id === foundJob.order_id) ?? null
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load installation job details."
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

  const resultItems = useMemo(
    () =>
      results.slice(0, 5).map((result) => ({
        key: result.id,
        href: "/admin/installation-results",
        title: `Result ${result.id}`,
        meta: `${result.result_status} · ${result.completion_date ?? "-"}`,
        description:
          result.work_summary ||
          (result.followup_required === 1
            ? result.followup_notes || "Follow-up required"
            : "Installation result record"),
      })),
    [results]
  );

  const documentItems = useMemo(
    () =>
      documents.slice(0, 5).map((document) => ({
        key: document.id,
        href: `/admin/generated-documents/${document.id}`,
        title:
          document.title || document.document_number || `Generated Document ${document.id}`,
        meta: `${document.generation_status} · ${document.generated_at ?? "-"}`,
        description: "Open the generated installation/service document preview.",
      })),
    [documents]
  );

  const attentionItems = useMemo(() => {
    if (!job) return [];

    const items: Array<{ key: string; title: string; description: string }> = [];

    if (results.length === 0) {
      items.push({
        key: "result",
        title: "No installation result has been captured yet",
        description:
          "Creating a result draft is the clearest next step when field work has started or needs structured follow-through notes.",
      });
    }

    if (job.job_status !== "completed") {
      items.push({
        key: "completion",
        title: "Job is not marked completed yet",
        description:
          "If the work is finished, marking the job completed will make the operational status clearer for downstream follow-through.",
      });
    }

    if (documents.length === 0) {
      items.push({
        key: "document",
        title: "No installation/service document has been generated yet",
        description:
          "Generate a service or installation document when the job needs a stored output for review or handoff.",
      });
    }

    return items;
  }, [documents.length, job, results.length]);

  async function handleCreateResultDraft() {
    if (!job || resultDraftState.loading) return;

    setResultDraftState({ loading: true, error: null, successId: null });

    try {
      const response = await apiPost<{ data?: { id?: number | null } | null }>(
        `/api/installation-jobs/${job.id}/create-result-draft`,
        {}
      );
      setResultDraftState({
        loading: false,
        error: null,
        successId:
          response.data && typeof response.data.id === "number" ? response.data.id : null,
      });
    } catch (err) {
      setResultDraftState({
        loading: false,
        error:
          err instanceof ApiError
            ? formatApiError(err)
            : err instanceof Error
              ? err.message
              : "Failed to create result draft",
        successId: null,
      });
    }
  }

  async function handleMarkCompleted() {
    if (!job || completionState.loading) return;

    setCompletionState({ loading: true, error: null, success: false });

    try {
      await apiPost(`/api/installation-jobs/${job.id}/mark-completed`, {});
      setCompletionState({ loading: false, error: null, success: true });
      setJob((current) =>
        current
          ? {
              ...current,
              job_status: "completed",
              actual_completed_at: current.actual_completed_at || new Date().toISOString(),
            }
          : current
      );
    } catch (err) {
      setCompletionState({
        loading: false,
        error:
          err instanceof ApiError
            ? formatApiError(err)
            : err instanceof Error
              ? err.message
              : "Failed to mark job completed",
        success: false,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Installation Job Workflow
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review operational context, capture follow-through, and generate supporting documents.
          </p>
        </div>
        <Link
          href="/admin/installation-jobs"
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
          <p className="text-sm text-zinc-500">Loading installation job details...</p>
        </DetailSection>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && job && (
        <>
          <DetailSection
            title={job.job_number || `Installation Job ${job.id}`}
            description="Current operational status, customer context, and completion readiness."
          >
            <SummaryGrid
              items={[
                { label: "Job Type", value: job.job_type },
                { label: "Job Status", value: job.job_status },
                { label: "Planned Date", value: job.planned_date || "-" },
                { label: "Completed At", value: job.actual_completed_at || "-" },
                { label: "Address", value: job.address_text || "-" },
                { label: "City", value: job.city || "-" },
                { label: "Contact Name", value: job.contact_name || "-" },
                { label: "Contact Phone", value: job.contact_phone || "-" },
              ]}
            />
          </DetailSection>

          <DetailSection
            title="Next Steps"
            description="Lightweight guidance based on the current installation-job state."
          >
            <AttentionList items={attentionItems} />
          </DetailSection>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <DetailSection
              title="Key Actions"
              description="Use these lightweight actions to capture field follow-through and keep document output close to the job."
            >
              <div className="mb-4 space-y-4">
                <ActionGroup
                  title="Primary Actions"
                  description="These are the most common next operational steps from this job page."
                  items={[
                    {
                      key: "result-draft",
                      label: resultDraftState.loading ? "Creating result..." : "Create Result Draft",
                      onClick: handleCreateResultDraft,
                      disabled: resultDraftState.loading,
                      primary: true,
                      helperText:
                        results.length === 0
                          ? "No result records exist yet for this job."
                          : "Create another result record when you need additional field-history detail.",
                    },
                    {
                      key: "mark-completed",
                      label:
                        completionState.loading
                          ? "Marking completed..."
                          : job.job_status === "completed"
                            ? "Already Completed"
                            : "Mark Completed",
                      onClick: handleMarkCompleted,
                      disabled: completionState.loading || job.job_status === "completed",
                      helperText:
                        job.job_status === "completed"
                          ? "This job is already marked completed."
                          : "Use when the operational work is finished and the status should be closed out.",
                    },
                  ]}
                />
                <ActionGroup
                  title="Supporting Actions"
                  description="Open related operational and commercial areas when you need more context."
                  items={[
                    {
                      key: "results",
                      label: "Open Results",
                      href: "/admin/installation-results",
                      helperText: "Review or add result records outside this page.",
                    },
                    ...(linkedOrder
                      ? [
                          {
                            key: "linked-order",
                            label: "Open Linked Order",
                            href: `/admin/orders/${linkedOrder.id}`,
                            helperText: "Continue the broader commercial workflow from the related order.",
                          },
                        ]
                      : []),
                  ]}
                />
              </div>

              {resultDraftState.error && (
                <pre
                  className="mb-4 whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                  role="alert"
                >
                  {resultDraftState.error}
                </pre>
              )}
              {resultDraftState.successId && (
                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  <p>Installation result draft created successfully.</p>
                  <Link
                    href="/admin/installation-results"
                    className="mt-2 inline-block text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Open installation results
                  </Link>
                </div>
              )}

              {completionState.error && (
                <pre
                  className="mb-4 whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                  role="alert"
                >
                  {completionState.error}
                </pre>
              )}
              {completionState.success && (
                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  Installation job marked completed.
                </div>
              )}

              <DocumentGenerationPanel
                entityLabel="Installation Job"
                entityListPath="/api/installation-jobs"
                entityId={id}
                generatePath={`/api/installation-jobs/${id}/generate-document`}
                summaryFields={[
                  { key: "id", label: "ID" },
                  { key: "job_number", label: "Job Number" },
                  { key: "job_type", label: "Job Type" },
                  { key: "job_status", label: "Job Status" },
                  { key: "planned_date", label: "Planned Date" },
                  { key: "order_id", label: "Order ID" },
                  { key: "order_line_id", label: "Order Line ID" },
                ]}
                templateTypes={["installation", "service"]}
                templateEntityType="installation_job"
                showSummary={false}
                showConfigHint={false}
                panelTitle="Generate Installation Document"
                panelDescription="Use an active installation or service template to create a stored document snapshot from this job."
              />
            </DetailSection>

            <div className="space-y-6">
              <DetailSection title="Linked Order" description="Commercial context associated with this installation job.">
                {linkedOrder ? (
                  <RelatedList
                    items={[
                      {
                        key: linkedOrder.id,
                        href: `/admin/orders/${linkedOrder.id}`,
                        title: linkedOrder.order_number,
                        meta: linkedOrder.order_status,
                        description:
                          job.order_line_id !== null
                            ? `Linked order line: ${job.order_line_id}`
                            : "Linked at order level",
                      },
                    ]}
                    emptyMessage=""
                  />
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No linked order is attached to this installation job.
                  </p>
                )}
              </DetailSection>

              <DetailSection
                title="Installation Results"
                description="Recent result records captured against this job."
                action={
                  <Link
                    href="/admin/installation-results"
                    className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    View all
                  </Link>
                }
              >
                <RelatedList
                  items={resultItems}
                  emptyMessage="No installation results have been recorded for this job yet."
                  emptyAction={
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Use the primary action above to create the first result draft.
                    </p>
                  }
                />
              </DetailSection>

              <DetailSection
                title="Generated Documents"
                description="Recent installation/service documents created from this job."
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
                  items={documentItems}
                  emptyMessage="No generated documents are linked directly to this installation job yet."
                  emptyAction={
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Generate an installation or service document from the action area on this page.
                    </p>
                  }
                />
              </DetailSection>
            </div>
          </div>

          {job.notes && (
            <DetailSection title="Notes" description="Additional field context stored on the installation job.">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{job.notes}</p>
            </DetailSection>
          )}
        </>
      )}
    </div>
  );
}
