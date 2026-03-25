"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  EasyWorkspaceLive,
  type EasyWorkspaceData,
} from "@/components/admin/easy/EasyWorkspaceLive";

type InstallationJobRow = {
  id: number;
  job_number: string;
  job_type: string;
  job_status: string;
  planned_date: string | null;
  contact_name: string | null;
};

type InstallationResultRow = {
  id: number;
  result_status: string;
};

async function loadInstallationsLiteData(): Promise<EasyWorkspaceData> {
  const [jobsRes, resultsRes] = await Promise.all([
    apiGet<{ data: InstallationJobRow[] }>("/api/installation-jobs"),
    apiGet<{ data: InstallationResultRow[] }>("/api/installation-results"),
  ]);

  const jobs = jobsRes.data ?? [];
  const results = resultsRes.data ?? [];

  return {
    stats: [
      {
        label: "Scheduled Jobs",
        value: jobs.filter((job) => job.job_status === "scheduled").length,
        hint: `${jobs.length} total jobs`,
      },
      {
        label: "In Progress",
        value: jobs.filter((job) => job.job_status === "in_progress").length,
        hint: "Field work underway",
      },
      {
        label: "Completed Jobs",
        value: jobs.filter((job) => job.job_status === "completed").length,
        hint: "Closed operational work",
      },
      {
        label: "Results",
        value: results.length,
        hint: `${results.filter((result) => result.result_status === "revisit_required").length} revisit required`,
      },
    ],
    activityTitle: "Recent and Upcoming Jobs",
    activityLinkHref: "/admin/installation-jobs",
    activityLinkLabel: "Open jobs",
    activityItems: jobs.slice(0, 5).map((job) => ({
      href: `/admin/installation-jobs/${job.id}`,
      title: job.job_number || `Installation Job ${job.id}`,
      meta: `${job.job_type} · ${job.job_status}`,
      description: [job.planned_date ? `Planned: ${job.planned_date}` : null, job.contact_name]
        .filter((value): value is string => Boolean(value))
        .join(" · "),
    })),
    activityEmptyMessage: "No installation jobs have been scheduled yet.",
  };
}

export default function InstallationsLitePage() {
  const loadData = useCallback(() => loadInstallationsLiteData(), []);

  return (
    <EasyWorkspaceLive
      title="Installations"
      summary="Stay close to planned field work, current jobs, and recorded outcomes without opening the full operational structure."
      description="This surface keeps installations readable for managers and coordinators. When deeper assignment detail or result records are needed, the full advanced installation area is still available."
      actions={[
        {
          href: "/admin/installation-jobs",
          label: "Open Installation Jobs",
          description: "Track scheduled, active, and completed field work.",
          primary: true,
        },
        {
          href: "/admin/installation-results",
          label: "Open Installation Results",
          description: "Review captured outcomes, issues, and follow-up notes.",
        },
        {
          href: "/admin/installation",
          label: "Open Advanced Installation Area",
          description: "Use the full operational installation domain when needed.",
        },
      ]}
      snapshotTitle="Installation Snapshot"
      activityTitle="Recent and Upcoming Jobs"
      loadData={loadData}
    />
  );
}
