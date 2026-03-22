"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPost,
  formatApiError,
  getApiBaseUrl,
} from "@/lib/api";
import type { EntityConfig, EntityField } from "@/lib/entity-config";

function buildPayload(fields: EntityField[], fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = fd.get(f.key);
    if (f.kind === "checkbox") {
      out[f.key] = raw === "on";
      continue;
    }
    if (f.kind === "number") {
      const s = String(raw ?? "").trim();
      if (!s) {
        if (!f.required) continue;
        continue;
      }
      const n = Number(s);
      if (!Number.isNaN(n)) out[f.key] = n;
      continue;
    }
    if (f.kind === "select") {
      const s = String(raw ?? "").trim();
      if (!s && !f.required) continue;
      out[f.key] = s;
      continue;
    }
    if (f.kind === "boolean-select") {
      const s = String(raw ?? "").trim();
      if (!s) continue;
      out[f.key] = s === "true";
      continue;
    }
    const s = String(raw ?? "").trim();
    if (!s && !f.required) continue;
    out[f.key] = s;
  }
  return out;
}

function cellValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function EntityListCreate({ config }: { config: EntityConfig }) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [configHint, setConfigHint] = useState(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
        setError(null);
      }
      setConfigHint(!getApiBaseUrl());
      try {
        const res = await apiGet<{ data: unknown[] }>(config.apiPath);
        const list = res.data;
        setRows(Array.isArray(list) ? (list as Record<string, unknown>[]) : []);
      } catch (e) {
        if (!options?.silent) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Failed to load list";
          setError(msg);
          setRows([]);
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [config.apiPath]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const form = e.currentTarget;
    try {
      const fd = new FormData(form);
      const payload = buildPayload([...config.fields], fd);
      const res = await apiPost<{ data: unknown }>(config.apiPath, payload);
      const created = res.data;
      if (created && typeof created === "object" && !Array.isArray(created)) {
        setRows((prev) => [...(prev ?? []), created as Record<string, unknown>]);
      }
      form.reset();
      void load({ silent: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? formatApiError(err)
          : err instanceof Error
            ? err.message
            : "Create failed";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const columnKeys =
    rows && rows.length > 0
      ? Object.keys(rows[0] as object)
      : ["id", ...config.fields.map((f) => f.key)];

  return (
    <div className="space-y-8">
      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> (e.g.{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">http://127.0.0.1:8787</code>).
        </div>
      )}

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Existing {config.title.toLowerCase()}
        </h2>
        {loading && (
          <p className="text-sm text-zinc-500" role="status">
            Loading...
          </p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && rows && rows.length === 0 && (
          <p className="text-sm text-zinc-500">No rows yet.</p>
        )}
        {!loading && rows && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-600">
                  {columnKeys.map((k) => (
                    <th
                      key={k}
                      className="whitespace-nowrap px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={
                      typeof (row as { id?: unknown }).id === "number"
                        ? (row as { id: number }).id
                        : i
                    }
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    {columnKeys.map((k) => (
                      <td
                        key={k}
                        className="max-w-xs truncate px-2 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200"
                        title={cellValue((row as Record<string, unknown>)[k])}
                      >
                        {cellValue((row as Record<string, unknown>)[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Add {config.title}
        </h2>
        <form
          className="max-w-xl space-y-3"
          onSubmit={onSubmit}
          aria-busy={submitting}
        >
          {config.fields.map((f) => (
            <label key={f.key} className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                {f.label}
                {f.required ? " *" : ""}
              </span>
              {f.kind === "textarea" && (
                <textarea
                  name={f.key}
                  required={f.required}
                  rows={3}
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              )}
              {f.kind === "text" && (
                <input
                  name={f.key}
                  type="text"
                  required={f.required}
                  autoComplete="off"
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              )}
              {f.kind === "number" && (
                <input
                  name={f.key}
                  type="number"
                  required={f.required}
                  min={f.min ?? (f.key === "sort_order" ? 0 : f.required ? 1 : undefined)}
                  step={f.step ?? 1}
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              )}
              {f.kind === "checkbox" && (
                <input
                  name={f.key}
                  type="checkbox"
                  defaultChecked={f.defaultChecked ?? false}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
              )}
              {f.kind === "select" && (
                <select
                  name={f.key}
                  required={f.required}
                  defaultValue={f.required ? (f.options?.[0]?.value ?? "") : ""}
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {!f.required && <option value="">-</option>}
                  {(f.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              {f.kind === "boolean-select" && (
                <select
                  name={f.key}
                  defaultValue=""
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">-</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              )}
            </label>
          ))}
          {submitError && (
            <pre
              className="whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
              role="alert"
            >
              {submitError}
            </pre>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      </section>
    </div>
  );
}
