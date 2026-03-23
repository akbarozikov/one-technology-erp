"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentGenerationPanel } from "@/components/admin/DocumentGenerationPanel";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Order Document Actions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate an order document from this order record.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to list
        </Link>
      </div>

      <DocumentGenerationPanel
        entityLabel="Order"
        entityListPath="/api/orders"
        entityId={id}
        generatePath={`/api/orders/${id}/generate-document`}
        summaryFields={[
          { key: "id", label: "ID" },
          { key: "order_number", label: "Order Number" },
          { key: "order_status", label: "Order Status" },
          { key: "payment_status", label: "Payment Status" },
          { key: "fulfillment_type", label: "Fulfillment Type" },
          { key: "grand_total", label: "Grand Total" },
          { key: "order_date", label: "Order Date" },
        ]}
        templateTypes={["order"]}
        templateEntityType="order"
      />
    </div>
  );
}
