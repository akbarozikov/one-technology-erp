"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/admin/LanguageProvider";
import { ApiError, getApiBaseUrl } from "@/lib/api";
import {
  EasyWorkspace,
  type EasyWorkspaceAction,
  type EasyWorkspaceItem,
  type EasyWorkspaceStat,
} from "./EasyWorkspace";

export type EasyWorkspaceData = {
  stats?: EasyWorkspaceStat[];
  activityTitle?: string;
  activityItems?: EasyWorkspaceItem[];
  activityEmptyMessage?: string;
  activityLinkHref?: string;
  activityLinkLabel?: string;
};

export function EasyWorkspaceLive({
  title,
  summary,
  description,
  actions,
  snapshotTitle,
  activityTitle,
  footerNote,
  loadData,
}: {
  title: string;
  summary: string;
  description: string;
  actions: EasyWorkspaceAction[];
  snapshotTitle?: string;
  activityTitle?: string;
  footerNote?: React.ReactNode;
  loadData: () => Promise<EasyWorkspaceData>;
}) {
  const { adminText } = useI18n();
  const [data, setData] = useState<EasyWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      try {
        const nextData = await loadData();
        if (!cancelled) {
          setData(nextData);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : adminText("Failed to load workspace context.")
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
  }, [loadData]);

  return (
    <div className="space-y-4">
      {configHint && (
        <div
          className="max-w-5xl rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {adminText("Set")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          {adminText("in")} <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> {adminText("to load live workspace updates.")}
        </div>
      )}

      <EasyWorkspace
        title={title}
        summary={summary}
        description={description}
        actions={actions}
        snapshotTitle={snapshotTitle}
        loading={loading}
        error={error}
        stats={data?.stats ?? []}
        activityTitle={data?.activityTitle ?? activityTitle}
        activityItems={data?.activityItems}
        activityEmptyMessage={data?.activityEmptyMessage}
        activityLinkHref={data?.activityLinkHref}
        activityLinkLabel={data?.activityLinkLabel}
        footerNote={footerNote}
      />
    </div>
  );
}
