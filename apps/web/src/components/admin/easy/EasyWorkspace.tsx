"use client";

import Link from "next/link";
import { useI18n } from "@/components/admin/LanguageProvider";

export type EasyWorkspaceAction = {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
};

export type EasyWorkspaceStat = {
  label: string;
  value: string | number;
  hint?: string;
};

export type EasyWorkspaceItem = {
  href?: string;
  title: string;
  meta?: string;
  description?: string;
};

export function EasyWorkspace({
  title,
  summary,
  description,
  actions,
  snapshotTitle = "Current Snapshot",
  stats = [],
  loading = false,
  error = null,
  activityTitle = "Recent Work",
  activityItems,
  activityEmptyMessage = "Nothing has been captured here yet.",
  activityLinkHref,
  activityLinkLabel = "Open full list",
  footerNote,
}: {
  title: string;
  summary: string;
  description: string;
  actions: EasyWorkspaceAction[];
  snapshotTitle?: string;
  stats?: EasyWorkspaceStat[];
  loading?: boolean;
  error?: string | null;
  activityTitle?: string;
  activityItems?: EasyWorkspaceItem[];
  activityEmptyMessage?: string;
  activityLinkHref?: string;
  activityLinkLabel?: string;
  footerNote?: React.ReactNode;
}) {
  const { adminText } = useI18n();
  return (
    <div className="max-w-5xl space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {adminText("Easy Mode")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {adminText(title)}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{adminText(summary)}</p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{adminText(description)}</p>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{adminText("Start Here")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded border px-4 py-3 transition ${
                action.primary
                  ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="font-medium">{adminText(action.label)}</div>
              <p
                className={`mt-1 text-sm ${
                  action.primary
                    ? "text-zinc-100 dark:text-zinc-700"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {adminText(action.description)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {(loading || error || stats.length > 0) && (
        <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {adminText(snapshotTitle)}
          </h2>
          {loading && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {adminText("Loading current context...")}
            </p>
          )}
          {!loading && error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && stats.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {adminText(stat.label)}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {stat.value}
                  </p>
                  {stat.hint && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {adminText(stat.hint)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(loading || error || activityItems !== undefined) && (
        <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {adminText(activityTitle)}
            </h2>
            {activityLinkHref && (
              <Link
                href={activityLinkHref}
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {adminText(activityLinkLabel)}
              </Link>
            )}
          </div>
          {loading && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {adminText("Loading recent work...")}
            </p>
          )}
          {!loading && !error && activityItems && activityItems.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {adminText(activityEmptyMessage)}
            </p>
          )}
          {!loading && !error && activityItems && activityItems.length > 0 && (
            <div className="mt-4 space-y-3">
              {activityItems.map((item, index) => {
                const content = (
                  <>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {adminText(item.title)}
                    </div>
                    {item.meta && (
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {adminText(item.meta)}
                      </div>
                    )}
                    {item.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {adminText(item.description)}
                      </p>
                    )}
                  </>
                );

                return item.href ? (
                  <Link
                    key={`${item.title}-${index}`}
                    href={item.href}
                    className="block rounded border border-zinc-100 px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {footerNote && (
        <section className="rounded border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
          {footerNote}
        </section>
      )}
    </div>
  );
}
