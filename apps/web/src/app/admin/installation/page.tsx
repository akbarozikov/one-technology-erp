"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  DomainLandingLive,
  type DomainLandingInsights,
} from "@/components/admin/domain/DomainLandingLive";

type InstallationJobRow = {
  id: number;
  job_number: string;
  job_type: string;
  job_status: string;
  planned_date: string | null;
  contact_name: string | null;
};

type InstallationAssignmentRow = {
  id: number;
};

type InstallationResultRow = {
  id: number;
  result_status: string;
};

async function loadInstallationInsights(): Promise<DomainLandingInsights> {
  const [jobsRes, assignmentsRes, resultsRes] = await Promise.all([
    apiGet<{ data: InstallationJobRow[] }>("/api/installation-jobs"),
    apiGet<{ data: InstallationAssignmentRow[] }>("/api/installation-assignments"),
    apiGet<{ data: InstallationResultRow[] }>("/api/installation-results"),
  ]);

  const jobs = jobsRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const results = resultsRes.data ?? [];

  return {
    stats: [
      {
        label: "Installation Jobs",
        value: jobs.length,
        hint: `${jobs.filter((job) => job.job_status === "scheduled").length} scheduled`,
      },
      {
        label: "In Progress",
        value: jobs.filter((job) => job.job_status === "in_progress").length,
        hint: `${jobs.filter((job) => job.job_status === "completed").length} completed`,
      },
      {
        label: "Assignments",
        value: assignments.length,
        hint: "Team members attached to jobs",
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
    activityEmptyMessage: "No installation jobs yet.",
  };
}

export default function InstallationLandingPage() {
  const loadData = useCallback(() => loadInstallationInsights(), []);

  return (
    <DomainLandingLive
      title="Installation"
      summary="Coordinate installation jobs, assignments, and recorded job outcomes."
      description="Use this area for operational follow-through after an order is confirmed. Jobs are the main entry point, while assignments and results support scheduling, field work, and completion history."
      links={[
        {
          href: "/admin/installation-jobs",
          label: "Installation Jobs",
          description: "Track planned, active, completed, and failed site work.",
        },
        {
          href: "/admin/installation-results",
          label: "Installation Results",
          description: "Store job outcomes, issues found, and follow-up requirements.",
        },
        {
          href: "/admin/installation-assignments",
          label: "Installation Assignments",
          description: "Assign employees to jobs with clear roles and timing.",
        },
      ]}
      loadData={loadData}
    />
  );
}
