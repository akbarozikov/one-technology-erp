"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  EasyWorkspaceLive,
  type EasyWorkspaceData,
} from "@/components/admin/easy/EasyWorkspaceLive";

type GeneratedDocumentRow = {
  id: number;
  title: string | null;
  document_number: string | null;
  entity_type: string;
  generation_status: string;
  generated_at: string | null;
};

type DocumentTemplateRow = {
  id: number;
  is_active: number;
};

async function loadDocumentsLiteData(): Promise<EasyWorkspaceData> {
  const [documentsRes, templatesRes] = await Promise.all([
    apiGet<{ data: GeneratedDocumentRow[] }>("/api/generated-documents"),
    apiGet<{ data: DocumentTemplateRow[] }>("/api/document-templates"),
  ]);

  const documents = documentsRes.data ?? [];
  const templates = templatesRes.data ?? [];

  return {
    stats: [
      {
        label: "Generated Documents",
        value: documents.length,
        hint: `${documents.filter((document) => document.generation_status === "generated").length} ready to open`,
      },
      {
        label: "Active Templates",
        value: templates.filter((template) => template.is_active === 1).length,
        hint: `${templates.length} total templates`,
      },
      {
        label: "Quote Documents",
        value: documents.filter((document) => document.entity_type === "quote_version").length,
        hint: "Proposal records",
      },
      {
        label: "Order & Job Documents",
        value: documents.filter(
          (document) =>
            document.entity_type === "order" || document.entity_type === "installation_job"
        ).length,
        hint: "Operational follow-through",
      },
    ],
    activityTitle: "Recent Documents",
    activityLinkHref: "/admin/generated-documents",
    activityLinkLabel: "Open document list",
    activityItems: documents.slice(0, 5).map((document) => ({
      href: `/admin/generated-documents/${document.id}`,
      title: document.title || document.document_number || `Generated Document ${document.id}`,
      meta: `${document.entity_type} · ${document.generation_status}`,
      description: document.generated_at
        ? `Generated at ${document.generated_at}`
        : "Stored generated document",
    })),
    activityEmptyMessage: "No generated documents are available yet.",
  };
}

export default function DocumentsLitePage() {
  const loadData = useCallback(() => loadDocumentsLiteData(), []);

  return (
    <EasyWorkspaceLive
      title="Documents"
      summary="Open, review, and share the generated documents that matter to everyday work."
      description="Use this lighter document surface when you mostly need to find proposal, order, or installation documents quickly. The full templates and link structure stay available in Advanced mode."
      actions={[
        {
          href: "/admin/generated-documents",
          label: "Open Generated Documents",
          description: "Preview, open, or download the latest saved documents.",
          primary: true,
        },
        {
          href: "/admin/document-templates",
          label: "Open Document Templates",
          description: "Review the templates that power document generation.",
        },
      ]}
      snapshotTitle="Document Snapshot"
      activityTitle="Recent Documents"
      loadData={loadData}
    />
  );
}
