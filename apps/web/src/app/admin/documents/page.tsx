"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  DomainLandingLive,
  type DomainLandingInsights,
} from "@/components/admin/domain/DomainLandingLive";

type DocumentTemplateRow = {
  id: number;
  is_active: number;
};

type GeneratedDocumentRow = {
  id: number;
  title: string;
  document_number: string | null;
  generation_status: string;
  entity_type: string;
  generated_at: string | null;
};

type DocumentLinkRow = {
  id: number;
};

async function loadDocumentInsights(): Promise<DomainLandingInsights> {
  const [templatesRes, documentsRes, linksRes] = await Promise.all([
    apiGet<{ data: DocumentTemplateRow[] }>("/api/document-templates"),
    apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
    apiGet<{ data: DocumentLinkRow[] }>("/api/document-links"),
  ]);

  const templates = templatesRes.data ?? [];
  const generatedDocuments = documentsRes.data ?? [];
  const documentLinks = linksRes.data ?? [];

  return {
    stats: [
      {
        label: "Templates",
        value: templates.length,
        hint: `${templates.filter((template) => template.is_active === 1).length} active`,
      },
      {
        label: "Generated Documents",
        value: generatedDocuments.length,
        hint: `${generatedDocuments.filter((document) => document.generation_status === "generated").length} generated`,
      },
      {
        label: "Failed Documents",
        value: generatedDocuments.filter((document) => document.generation_status === "failed").length,
        hint: "Documents needing attention",
      },
      {
        label: "Document Links",
        value: documentLinks.length,
        hint: "Cross-entity document references",
      },
    ],
    activityTitle: "Recent Generated Documents",
    activityLinkHref: "/admin/generated-documents",
    activityLinkLabel: "Open documents",
    activityItems: generatedDocuments.slice(0, 5).map((document) => ({
      href: `/admin/generated-documents/${document.id}`,
      title:
        document.title ||
        document.document_number ||
        `Generated Document ${document.id}`,
      meta: `${document.entity_type} · ${document.generation_status}`,
      description: document.generated_at
        ? `Generated at ${document.generated_at}`
        : "Generated document record",
    })),
    activityEmptyMessage: "No generated documents yet.",
  };
}

export default function DocumentsLandingPage() {
  const loadData = useCallback(() => loadDocumentInsights(), []);

  return (
    <DomainLandingLive
      title="Documents"
      summary="Manage reusable templates, saved document outputs, and document links."
      description="Use this area when you need proposal, order, or installation document history. Generated documents are usually the best starting point for review, preview, and follow-through."
      links={[
        {
          href: "/admin/generated-documents",
          label: "Generated Documents",
          description: "Open saved proposal, order, and installation document records.",
        },
        {
          href: "/admin/document-templates",
          label: "Document Templates",
          description: "Maintain the active templates used by document generation actions.",
        },
        {
          href: "/admin/document-links",
          label: "Document Links",
          description: "See how generated documents connect back to business records.",
        },
      ]}
      loadData={loadData}
    />
  );
}
