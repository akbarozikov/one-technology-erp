import { DomainLanding } from "@/components/admin/domain/DomainLanding";

export default function DocumentsLandingPage() {
  return (
    <DomainLanding
      title="Documents"
      summary="Manage reusable templates, generated records, and cross-entity document links."
      description="Use this area when you need proposal, order, or installation document history. Generated documents are the most practical starting point for review, preview, and follow-through."
      links={[
        {
          href: "/admin/generated-documents",
          label: "Generated Documents",
          description: "Open rendered proposal, order, and installation document records.",
        },
        {
          href: "/admin/document-templates",
          label: "Document Templates",
          description: "Maintain active templates used by the backend document actions.",
        },
        {
          href: "/admin/document-links",
          label: "Document Links",
          description: "Inspect how generated documents relate back to business entities.",
        },
      ]}
    />
  );
}
