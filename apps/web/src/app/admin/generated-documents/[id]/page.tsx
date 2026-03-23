"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, getApiBaseUrl } from "@/lib/api";

type GeneratedDocument = Record<string, unknown> & {
  id: number;
  title?: string | null;
  document_number?: string | null;
  generation_status?: string | null;
  template_id?: number | null;
  entity_type?: string | null;
  entity_id?: number | null;
  generated_at?: string | null;
  generated_by_user_id?: number | null;
  mime_type?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  rendered_content?: string | null;
};

type DocumentLinkRow = Record<string, unknown> & {
  id: number;
  generated_document_id: number;
  entity_type?: string | null;
  entity_id?: number | null;
  link_role?: string | null;
  created_at?: string | null;
};

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

function metadataValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

function sanitizeFilenamePart(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[<>:"/\\|?*\x00-\x1f]+/g, "-").replace(/\s+/g, " ");
}

function buildHtmlFilename(document: GeneratedDocument): string {
  const fileName =
    typeof document.file_name === "string" ? sanitizeFilenamePart(document.file_name) : "";
  if (fileName) {
    return fileName.toLowerCase().endsWith(".html") ? fileName : `${fileName}.html`;
  }

  const documentNumber =
    typeof document.document_number === "string"
      ? sanitizeFilenamePart(document.document_number)
      : "";
  if (documentNumber) {
    return `${documentNumber}.html`;
  }

  const title = typeof document.title === "string" ? sanitizeFilenamePart(document.title) : "";
  if (title) {
    return `${title}.html`;
  }

  return `generated-document-${document.id}.html`;
}

export default function GeneratedDocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [links, setLinks] = useState<DocumentLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid generated document id.");
        setLoading(false);
        return;
      }

      try {
        const [docsRes, linksRes] = await Promise.all([
          apiGet<{ data: unknown[] }>("/api/generated-documents"),
          apiGet<{ data: unknown[] }>("/api/document-links"),
        ]);

        if (cancelled) return;

        const docs = Array.isArray(docsRes.data)
          ? (docsRes.data as GeneratedDocument[])
          : [];
        const found = docs.find((row) => row.id === id) ?? null;

        if (!found) {
          setError(`Generated document ${id} not found.`);
          setDocument(null);
          setLinks([]);
          return;
        }

        const allLinks = Array.isArray(linksRes.data)
          ? (linksRes.data as DocumentLinkRow[])
          : [];

        setDocument(found);
        setLinks(
          allLinks.filter((row) => row.generated_document_id === found.id)
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load generated document."
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

  const renderedContent =
    typeof document?.rendered_content === "string"
      ? document.rendered_content
      : null;
  const htmlPreview = useMemo(
    () => (renderedContent && looksLikeHtml(renderedContent) ? renderedContent : null),
    [renderedContent]
  );
  const hasRenderedContent = typeof renderedContent === "string" && renderedContent.length > 0;

  function createHtmlBlobUrl(): string | null {
    if (!hasRenderedContent || !renderedContent) {
      return null;
    }
    return URL.createObjectURL(new Blob([renderedContent], { type: "text/html;charset=utf-8" }));
  }

  function handleOpenDocument() {
    const blobUrl = createHtmlBlobUrl();
    if (!blobUrl) return;
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  }

  function handleDownloadHtml() {
    if (!document) return;
    const blobUrl = createHtmlBlobUrl();
    if (!blobUrl) return;

    const anchor = window.document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = buildHtmlFilename(document);
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Generated Document Detail
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Readable metadata and stored rendered output preview.
          </p>
        </div>
        <Link
          href="/admin/generated-documents"
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
          Set{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            NEXT_PUBLIC_API_BASE_URL
          </code>{" "}
          in{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            .env.local
          </code>
          .
        </div>
      )}

      {loading && (
        <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Loading...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && document && (
        <>
          <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Metadata
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Title
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.title)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Document Number
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.document_number)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Generation Status
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.generation_status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Template ID
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.template_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Entity Type
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.entity_type)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Entity ID
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.entity_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Generated At
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.generated_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Generated By User ID
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.generated_by_user_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  MIME Type
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.mime_type)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  File Name
                </dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                  {metadataValue(document.file_name)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  File URL
                </dt>
                <dd className="break-all text-sm text-zinc-900 dark:text-zinc-100">
                  {document.file_url ? (
                    <a
                      href={String(document.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {String(document.file_url)}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Rendered Content Preview
            </h2>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenDocument}
                disabled={!hasRenderedContent}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Open Document
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                disabled={!hasRenderedContent}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Download HTML
              </button>
              {hasRenderedContent && (
                <button
                  type="button"
                  onClick={() => setShowSource((current) => !current)}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {showSource ? "Hide Source" : "View Raw HTML"}
                </button>
              )}
            </div>
            {!renderedContent && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No rendered content is stored for this generated document.
              </p>
            )}
            {renderedContent && htmlPreview && (
              <div className="overflow-hidden rounded border border-zinc-200 dark:border-zinc-700">
                <iframe
                  title="Generated document preview"
                  srcDoc={htmlPreview}
                  sandbox=""
                  className="h-[720px] w-full bg-white"
                />
              </div>
            )}
            {renderedContent && !htmlPreview && (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
                {renderedContent}
              </pre>
            )}
            {hasRenderedContent && showSource && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Raw Source
                </h3>
                <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
                  {renderedContent}
                </pre>
              </div>
            )}
          </section>

          <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Document Links
            </h2>
            {links.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No related document links found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                        id
                      </th>
                      <th className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                        entity_type
                      </th>
                      <th className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                        entity_id
                      </th>
                      <th className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                        link_role
                      </th>
                      <th className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                        created_at
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr
                        key={link.id}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {link.id}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {metadataValue(link.entity_type)}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {metadataValue(link.entity_id)}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {metadataValue(link.link_role)}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {metadataValue(link.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
