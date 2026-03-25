"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPost,
  formatApiError,
  getApiBaseUrl,
} from "@/lib/api";

type TemplateRow = {
  id: number;
  name?: string | null;
  code?: string | null;
  template_type?: string | null;
  entity_type?: string | null;
  is_active?: number | null;
};

type GeneratedDocumentRow = {
  id: number;
  title?: string | null;
  document_number?: string | null;
};

type SummaryField = {
  key: string;
  label: string;
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

type Props = {
  entityLabel: string;
  entityListPath: string;
  entityId: number;
  generatePath: string;
  summaryFields: SummaryField[];
  templateTypes: string[];
  templateEntityType: string;
  showSummary?: boolean;
  panelTitle?: string;
  panelDescription?: string;
  showConfigHint?: boolean;
  onGenerated?: (document: GeneratedDocumentRow | null) => void;
};

export function DocumentGenerationPanel({
  entityLabel,
  entityListPath,
  entityId,
  generatePath,
  summaryFields,
  templateTypes,
  templateEntityType,
  showSummary = true,
  panelTitle = "Generate Document",
  panelDescription,
  showConfigHint = true,
  onGenerated,
}: Props) {
  const templateTypeKey = templateTypes.join("|");
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    generatedDocument: GeneratedDocumentRow | null;
  } | null>(null);
  const [configHint, setConfigHint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      if (!Number.isInteger(entityId) || entityId <= 0) {
        setError(`Invalid ${entityLabel.toLowerCase()} id.`);
        setLoading(false);
        return;
      }

      try {
        const [entityResponse, templateResponse] = await Promise.all([
          apiGet<{ data: unknown[] }>(entityListPath),
          apiGet<{ data: unknown[] }>("/api/document-templates"),
        ]);

        if (cancelled) return;

        const rows = Array.isArray(entityResponse.data)
          ? (entityResponse.data as Record<string, unknown>[])
          : [];
        const found = rows.find((row) => row.id === entityId) ?? null;
        if (!found) {
          setError(`${entityLabel} ${entityId} not found.`);
          setEntity(null);
          setTemplates([]);
          return;
        }

        const compatibleTemplates = (
          Array.isArray(templateResponse.data)
            ? (templateResponse.data as TemplateRow[])
            : []
        ).filter(
          (template) =>
            template.is_active === 1 &&
            template.entity_type === templateEntityType &&
            template.template_type !== null &&
            template.template_type !== undefined &&
            templateTypes.includes(template.template_type)
        );

        setEntity(found);
        setTemplates(compatibleTemplates);
        setSelectedTemplateId((current) => current || String(compatibleTemplates[0]?.id ?? ""));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : `Failed to load ${entityLabel.toLowerCase()} data.`
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
  }, [entityId, entityLabel, entityListPath, templateEntityType, templateTypeKey, templateTypes]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const payload: Record<string, unknown> = {
        template_id: Number(selectedTemplateId),
      };
      if (documentNumber.trim()) {
        payload.document_number = documentNumber.trim();
      }
      if (title.trim()) {
        payload.title = title.trim();
      }

      const response = await apiPost<{
        data?: { generated_document?: GeneratedDocumentRow | null } | null;
      }>(generatePath, payload);

      const generatedDocument = response.data?.generated_document ?? null;
      setSuccess({
        message: "Document generated successfully.",
        generatedDocument,
      });
      onGenerated?.(generatedDocument);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? formatApiError(err)
          : err instanceof Error
            ? err.message
            : "Generation failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {showConfigHint && configHint && (
        <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      {loading && (
        <section className="app-panel p-5">
          <p className="text-sm text-zinc-500">Loading document options...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[1.2rem] border border-red-200 bg-red-50/90 p-5 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && entity && (
        <>
          {showSummary && (
            <section className="app-panel p-5 lg:p-6">
              <div className="mb-4 space-y-1.5">
                <h2 className="app-section-title">{entityLabel} snapshot</h2>
                <p className="app-section-subtitle">Review the current record before generating a document from it.</p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryFields.map((field) => (
                  <div key={field.key} className="app-panel-muted px-4 py-4">
                    <dt className="app-kicker">{field.label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {displayValue(entity[field.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="app-panel-strong p-5 lg:p-6">
            <div className="mb-5 space-y-1.5">
              <h2 className="app-section-title">{panelTitle}</h2>
              <p className="app-section-subtitle">
                {panelDescription || "Pick the right template, optionally adjust the title or number, and store a readable document snapshot for this workflow record."}
              </p>
            </div>

            {templates.length === 0 ? (
              <div className="app-empty space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <p>No active templates match this record yet.</p>
                <p>
                  Create or activate a compatible template in {" "}
                  <Link href="/admin/document-templates" className="app-link">
                    Document Templates
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <form className="max-w-3xl space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-zinc-700 dark:text-zinc-300">Template *</span>
                    <select
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                      required
                      className="app-input"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name || `Template ${template.id}`}
                          {template.code ? ` (${template.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="app-panel-muted px-4 py-4">
                    <p className="app-kicker">Compatibility</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {selectedTemplate
                        ? `Ready for ${displayValue(selectedTemplate.entity_type)} documents in the ${displayValue(selectedTemplate.template_type)} family.`
                        : "Choose a template to confirm the document type."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-zinc-700 dark:text-zinc-300">Document Number</span>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(event) => setDocumentNumber(event.target.value)}
                      className="app-input"
                    />
                    <span className="mt-1.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Leave blank to use the backend default.
                    </span>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-zinc-700 dark:text-zinc-300">Title</span>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="app-input"
                    />
                    <span className="mt-1.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Override the default title only when you need something clearer.
                    </span>
                  </label>
                </div>

                {submitError && (
                  <pre className="whitespace-pre-wrap break-words rounded-[1.2rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
                    {submitError}
                  </pre>
                )}

                {success && (
                  <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                    <p>{success.message}</p>
                    {success.generatedDocument?.id ? (
                      <Link href={`/admin/generated-documents/${success.generatedDocument.id}`} className="app-link mt-2 inline-block">
                        Open the generated document
                      </Link>
                    ) : null}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={submitting || !selectedTemplateId} className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? "Generating..." : "Generate document"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
