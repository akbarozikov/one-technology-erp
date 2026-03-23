"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentGenerationPanel } from "@/components/admin/DocumentGenerationPanel";

export default function QuoteVersionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quote Version Document Actions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate a commercial proposal document from this quote version.
          </p>
        </div>
        <Link
          href="/admin/quote-versions"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to list
        </Link>
      </div>

      <DocumentGenerationPanel
        entityLabel="Quote Version"
        entityListPath="/api/quote-versions"
        entityId={id}
        generatePath={`/api/quote-versions/${id}/generate-document`}
        summaryFields={[
          { key: "id", label: "ID" },
          { key: "quote_id", label: "Quote ID" },
          { key: "version_number", label: "Version Number" },
          { key: "version_status", label: "Version Status" },
          { key: "reservation_status", label: "Reservation Status" },
          { key: "grand_total", label: "Grand Total" },
          { key: "created_at", label: "Created At" },
        ]}
        templateTypes={["quote"]}
        templateEntityType="quote_version"
      />
    </div>
  );
}
