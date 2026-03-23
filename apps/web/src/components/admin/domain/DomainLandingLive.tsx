"use client";

import { useEffect, useState } from "react";
import { ApiError, getApiBaseUrl } from "@/lib/api";
import {
  DomainLanding,
  type DomainLandingActivityItem,
  type DomainLandingLink,
  type DomainLandingStat,
} from "./DomainLanding";

export type DomainLandingInsights = {
  statsTitle?: string;
  stats?: DomainLandingStat[];
  activityTitle?: string;
  activityItems?: DomainLandingActivityItem[];
  activityEmptyMessage?: string;
  activityLinkHref?: string;
  activityLinkLabel?: string;
};

export function DomainLandingLive({
  title,
  summary,
  description,
  links,
  loadData,
}: {
  title: string;
  summary: string;
  description: string;
  links: DomainLandingLink[];
  loadData: () => Promise<DomainLandingInsights>;
}) {
  const [data, setData] = useState<DomainLandingInsights | null>(null);
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
              : "Failed to load domain context."
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
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>.
        </div>
      )}

      <DomainLanding
        title={title}
        summary={summary}
        description={description}
        links={links}
        statsTitle={data?.statsTitle}
        stats={data?.stats}
        insightsLoading={loading}
        insightsError={error}
        activityTitle={data?.activityTitle}
        activityItems={data?.activityItems}
        activityEmptyMessage={data?.activityEmptyMessage}
        activityLinkHref={data?.activityLinkHref}
        activityLinkLabel={data?.activityLinkLabel}
      />
    </div>
  );
}
