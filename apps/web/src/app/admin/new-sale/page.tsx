"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  EasyWorkspaceLive,
  type EasyWorkspaceData,
} from "@/components/admin/easy/EasyWorkspaceLive";

type QuoteRow = {
  id: number;
  quote_number: string;
  status: string;
};

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
};

type ProductRow = {
  id: number;
  name: string;
  status: string;
};

type ConfigurationRow = {
  id: number;
  configuration_code: string | null;
  status: string;
};

async function loadNewSaleData(): Promise<EasyWorkspaceData> {
  const [quotesRes, versionsRes, productsRes, configurationsRes] = await Promise.all([
    apiGet<{ data: QuoteRow[] }>("/api/quotes"),
    apiGet<{ data: QuoteVersionRow[] }>("/api/quote-versions"),
    apiGet<{ data: ProductRow[] }>("/api/products"),
    apiGet<{ data: ConfigurationRow[] }>("/api/door-configurations"),
  ]);

  const quotes = quotesRes.data ?? [];
  const versions = versionsRes.data ?? [];
  const products = productsRes.data ?? [];
  const configurations = configurationsRes.data ?? [];

  return {
    stats: [
      {
        label: "Open Quotes",
        value: quotes.filter((quote) => ["draft", "active", "sent"].includes(quote.status)).length,
        hint: `${quotes.length} total quotes`,
      },
      {
        label: "Prepared Versions",
        value: versions.filter((version) =>
          ["prepared", "sent", "accepted"].includes(version.version_status)
        ).length,
        hint: "Ready for proposal or order follow-through",
      },
      {
        label: "Active Products",
        value: products.filter((product) => product.status === "active").length,
        hint: "Catalog items ready to sell",
      },
      {
        label: "Configurations",
        value: configurations.length,
        hint: "Reusable configured solutions",
      },
    ],
    activityTitle: "Recent Sale Starters",
    activityLinkHref: "/admin/quote-versions",
    activityLinkLabel: "Open quote versions",
    activityItems: [
      ...versions.slice(0, 3).map((version) => ({
        href: `/admin/quote-versions/${version.id}`,
        title: `Quote ${version.quote_id} · Version ${version.version_number}`,
        meta: version.version_status,
        description: "Open this version to generate a proposal or move it toward an order.",
      })),
      ...quotes.slice(0, 2).map((quote) => ({
        href: "/admin/quotes",
        title: quote.quote_number || `Quote ${quote.id}`,
        meta: quote.status,
        description: "Review the parent quote and continue building the sale.",
      })),
    ],
    activityEmptyMessage: "No quotes or prepared versions yet. Start with the quote list.",
  };
}

export default function NewSalePage() {
  const loadData = useCallback(() => loadNewSaleData(), []);

  return (
    <EasyWorkspaceLive
      title="New Sale"
      summary="Start a sale from the simplest entry points: products, configurations, quotes, and quote versions."
      description="This surface keeps the early sales workflow focused on customer-facing work. Use it to begin a quote, review prepared versions, and move toward a proposal or order without diving into the full technical ERP."
      actions={[
        {
          href: "/admin/quotes",
          label: "Start with Quotes",
          description: "Create or continue a customer quote.",
          primary: true,
        },
        {
          href: "/admin/quote-versions",
          label: "Review Quote Versions",
          description: "Generate proposals or continue into order creation.",
        },
        {
          href: "/admin/products",
          label: "Browse Products",
          description: "Check what is sellable before pricing the sale.",
        },
        {
          href: "/admin/door-configurations",
          label: "Open Configurations",
          description: "Use saved configurations when the sale is solution-driven.",
        },
      ]}
      snapshotTitle="Sales Start Snapshot"
      activityTitle="Recent Sale Starters"
      footerNote={
        <>
          When you need full line-level control, constructor detail, or advanced commercial records,
          switch to Advanced mode and continue from the same ERP.
        </>
      }
      loadData={loadData}
    />
  );
}
