"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentGenerationPanel } from "@/components/admin/DocumentGenerationPanel";

export default function InstallationJobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Installation Job Document Actions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate an installation or service document from this job.
          </p>
        </div>
        <Link
          href="/admin/installation-jobs"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to list
        </Link>
      </div>

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
      />
    </div>
  );
}
