"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPost,
  formatApiError,
  getApiBaseUrl,
} from "@/lib/api";
import type { EntityConfig, EntityField, EntityTableColumn } from "@/lib/entity-config";

type LookupOption = {
  value: string;
  label: string;
};

type FieldGroup = {
  key: string;
  label: string;
  description?: string;
  fields: EntityField[];
};

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
      if (f.lookup) {
        const n = Number(s);
        out[f.key] = Number.isNaN(n) ? s : n;
      } else {
        out[f.key] = s;
      }
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

function titleCaseKey(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateValue(value: unknown, includeTime: boolean): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const raw = String(value).trim();
  if (!raw) {
    return "—";
  }

  const normalized =
    includeTime && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat(
    undefined,
    includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }
  ).format(parsed);
}

function formatMoneyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return amount.toFixed(2);
}

function statusTone(value: string): string {
  const normalized = value.toLowerCase();

  if (
    [
      "active",
      "confirmed",
      "completed",
      "paid",
      "generated",
      "accepted",
      "fulfilled",
      "ready_for_fulfillment",
      "recorded",
    ].includes(normalized)
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  }

  if (
    [
      "draft",
      "scheduled",
      "in_progress",
      "prepared",
      "partially_paid",
      "partially_reserved",
      "fully_reserved",
      "sent",
      "archived",
      "pending",
      "reserved",
      "issued",
    ].includes(normalized)
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  }

  if (
    [
      "cancelled",
      "failed",
      "rejected",
      "expired",
      "released",
      "consumed",
      "refunded",
      "suspended",
      "inactive",
      "archived",
    ].includes(normalized)
  ) {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

function isDetailCell(
  config: EntityConfig,
  row: Record<string, unknown>,
  key: string
): boolean {
  if (!config.detailBasePath) return false;
  if (typeof row.id !== "number") return false;
  const preferredKey = config.detailLabelKey ?? "id";
  if (key !== preferredKey) return false;
  const value = row[key];
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function buildLookupLabel(
  row: Record<string, unknown>,
  field: EntityField
): string {
  const lookup = field.lookup;
  if (!lookup) {
    return String(row.id ?? "");
  }

  const parts = lookup.labelKeys
    .map((key) => row[key])
    .filter((value): value is string | number => {
      if (typeof value === "number") return true;
      return typeof value === "string" && value.trim().length > 0;
    })
    .map((value) => String(value).trim());

  const main = parts.length > 0 ? parts.join(" · ") : String(row.id ?? "");
  if (lookup.includeIdInLabel === false || row.id === undefined) {
    return main;
  }
  return `${row.id} · ${main}`;
}

function resolveLookupCell(
  field: EntityField | undefined,
  rawValue: unknown,
  lookupOptions: Record<string, LookupOption[]>
): string | null {
  if (!field?.lookup || rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const match = (lookupOptions[field.key] ?? []).find(
    (option) => option.value === String(rawValue)
  );
  return match?.label ?? null;
}

function renderTableCellValue(
  row: Record<string, unknown>,
  column: EntityTableColumn,
  field: EntityField | undefined,
  lookupOptions: Record<string, LookupOption[]>
): React.ReactNode {
  const rawValue = row[column.key];
  const displayKind =
    column.format ??
    (column.key === "status" || column.key.endsWith("_status")
      ? "status"
      : field?.kind === "date"
        ? "date"
        : field?.kind === "datetime-local"
          ? "datetime"
          : field?.kind === "checkbox" || field?.kind === "boolean-select"
            ? "boolean"
            : "text");

  const lookupLabel = resolveLookupCell(field, rawValue, lookupOptions);
  const textValue = lookupLabel ?? cellValue(rawValue);

  if (displayKind === "boolean") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return "—";
    }
    const truthy =
      rawValue === true ||
      rawValue === 1 ||
      rawValue === "1" ||
      String(rawValue).toLowerCase() === "true";
    return truthy ? "Yes" : "No";
  }

  if (displayKind === "date") {
    return formatDateValue(rawValue, false);
  }

  if (displayKind === "datetime") {
    return formatDateValue(rawValue, true);
  }

  if (displayKind === "money") {
    return formatMoneyValue(rawValue);
  }

  if (displayKind === "status") {
    const label =
      rawValue === null || rawValue === undefined || rawValue === ""
        ? "—"
        : lookupLabel ??
          field?.options?.find((option) => option.value === String(rawValue))?.label ??
          String(rawValue);
    if (label === "—") {
      return label;
    }
    return (
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone(
          label
        )}`}
      >
        {label}
      </span>
    );
  }

  return textValue || "—";
}

function renderField(
  f: EntityField,
  lookupOptions: Record<string, LookupOption[]>
): React.ReactNode {
  return (
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
      {f.kind === "date" && (
        <input
          name={f.key}
          type="date"
          required={f.required}
          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      )}
      {f.kind === "datetime-local" && (
        <input
          name={f.key}
          type="datetime-local"
          required={f.required}
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
          defaultValue={
            f.required
              ? (f.lookup
                  ? (lookupOptions[f.key]?.[0]?.value ?? "")
                  : (f.options?.[0]?.value ?? ""))
              : ""
          }
          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {!f.required && <option value="">-</option>}
          {(f.lookup ? (lookupOptions[f.key] ?? []) : (f.options ?? [])).map((o) => (
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
  );
}

export function EntityListCreate({ config }: { config: EntityConfig }) {
  const createEnabled = config.createEnabled ?? true;
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [configHint, setConfigHint] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [lookupOptions, setLookupOptions] = useState<Record<string, LookupOption[]>>(
    {}
  );

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

  useEffect(() => {
    let cancelled = false;

    const fieldsWithLookup = config.fields.filter((field) => field.lookup);
    if (fieldsWithLookup.length === 0) {
      setLookupOptions({});
      return;
    }

    async function loadLookups() {
      try {
        const entries = await Promise.all(
          fieldsWithLookup.map(async (field) => {
            const res = await apiGet<{ data: unknown[] }>(field.lookup!.apiPath);
            const list = Array.isArray(res.data)
              ? (res.data as Record<string, unknown>[])
              : [];
            const options = list
              .map((row) => {
                const valueKey = field.lookup?.valueKey ?? "id";
                const value = row[valueKey];
                if (value === null || value === undefined) {
                  return null;
                }
                return {
                  value: String(value),
                  label: buildLookupLabel(row, field),
                } satisfies LookupOption;
              })
              .filter((option): option is LookupOption => option !== null);
            return [field.key, options] as const;
          })
        );

        if (!cancelled) {
          setLookupOptions(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setLookupOptions({});
        }
      }
    }

    void loadLookups();

    return () => {
      cancelled = true;
    };
  }, [config.fields]);

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

  const filteredRows = useMemo(() => {
    const currentRows = rows ?? [];
    if (currentRows.length === 0) {
      return currentRows;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return currentRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        !(config.searchKeys && config.searchKeys.length > 0) ||
        config.searchKeys.some((key) =>
          cellValue(row[key]).toLowerCase().includes(normalizedSearch)
        );

      if (!matchesSearch) {
        return false;
      }

      if (!config.filters || config.filters.length === 0) {
        return true;
      }

      return config.filters.every((filter) => {
        const selected = filterValues[filter.key] ?? "";
        if (!selected) {
          return true;
        }
        return cellValue(row[filter.key]) === selected;
      });
    });
  }, [config.filters, config.searchKeys, filterValues, rows, searchTerm]);

  const fieldsByKey = useMemo(
    () => Object.fromEntries(config.fields.map((field) => [field.key, field])),
    [config.fields]
  );

  const columnKeys =
    rows && rows.length > 0
      ? Object.keys(rows[0] as object)
      : [
          "id",
          ...config.fields.map((f) => f.key),
          ...(createEnabled ? [] : ["created_at", "updated_at"]),
        ];

  const tableColumns = useMemo<EntityTableColumn[]>(
    () =>
      config.tableColumns && config.tableColumns.length > 0
        ? config.tableColumns
        : columnKeys.map((key) => ({
            key,
            label: fieldsByKey[key]?.label ?? titleCaseKey(key),
          })),
    [columnKeys, config.tableColumns, fieldsByKey]
  );

  const fieldGroups = useMemo<FieldGroup[]>(() => {
    if (!config.formSections || config.formSections.length === 0) {
      return [{ key: "default", label: "Details", fields: config.fields }];
    }

    const groups = config.formSections
      .map((section) => ({
        key: section.key,
        label: section.label,
        description: section.description,
        fields: config.fields.filter((field) => field.section === section.key),
      }))
      .filter((group) => group.fields.length > 0);

    const ungroupedFields = config.fields.filter((field) => !field.section);
    if (ungroupedFields.length > 0) {
      groups.push({
        key: "other",
        label: "Other",
        description: undefined,
        fields: ungroupedFields,
      });
    }

    return groups;
  }, [config.fields, config.formSections]);

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
          Current {config.title.toLowerCase()}
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
          <p className="text-sm text-zinc-500">Nothing has been added here yet.</p>
        )}
        {!loading && rows && rows.length > 0 && (
          <div className="space-y-4">
            {((config.searchKeys && config.searchKeys.length > 0) ||
              (config.filters && config.filters.length > 0)) && (
              <div className="flex flex-col gap-3 rounded border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                {config.searchKeys && config.searchKeys.length > 0 && (
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                      Search
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder={`Search ${config.title.toLowerCase()}...`}
                      className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </label>
                )}
                {config.filters && config.filters.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {config.filters.map((filter) => (
                      <label key={filter.key} className="block text-sm">
                        <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                          {filter.label}
                        </span>
                        <select
                          value={filterValues[filter.key] ?? ""}
                          onChange={(event) =>
                            setFilterValues((current) => ({
                              ...current,
                              [filter.key]: event.target.value,
                            }))
                          }
                          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          <option value="">All</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Showing {filteredRows.length} of {rows.length} items.
                </p>
              </div>
            )}

            {filteredRows.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No items match the current search or filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-600">
                      {tableColumns.map((column) => (
                        <th
                          key={column.key}
                          className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          {column.label ?? fieldsByKey[column.key]?.label ?? titleCaseKey(column.key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr
                        key={
                          typeof (row as { id?: unknown }).id === "number"
                            ? (row as { id: number }).id
                            : i
                        }
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        {tableColumns.map((column) => (
                          <td
                            key={column.key}
                            className="max-w-xs px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                            title={cellValue((row as Record<string, unknown>)[column.key])}
                          >
                            {isDetailCell(
                              config,
                              row as Record<string, unknown>,
                              column.key
                            ) ? (
                              <Link
                                href={`${config.detailBasePath}/${(row as { id: number }).id}`}
                                className="inline-flex max-w-full truncate font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:decoration-blue-700 dark:hover:text-blue-200"
                              >
                                {renderTableCellValue(
                                  row as Record<string, unknown>,
                                  column,
                                  fieldsByKey[column.key],
                                  lookupOptions
                                )}
                              </Link>
                            ) : (
                              <span className="inline-flex max-w-full items-center truncate">
                                {renderTableCellValue(
                                  row as Record<string, unknown>,
                                  column,
                                  fieldsByKey[column.key],
                                  lookupOptions
                                )}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {createEnabled && (
        <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Add {config.title}
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Fill in the main details below, then save to create a new record.
        </p>
          <form
            className="max-w-xl space-y-3"
            onSubmit={onSubmit}
            aria-busy={submitting}
          >
            {fieldGroups.map((group) => (
              <section
                key={group.key}
                className="rounded border border-zinc-100 p-4 dark:border-zinc-800"
              >
                {config.formSections && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {group.label}
                    </h3>
                    {group.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {group.description}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  {group.fields.map((field) => renderField(field, lookupOptions))}
                </div>
              </section>
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
