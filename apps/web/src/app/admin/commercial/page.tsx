import { DomainLanding } from "@/components/admin/domain/DomainLanding";

export default function CommercialLandingPage() {
  return (
    <DomainLanding
      title="Commercial"
      summary="Work with quotes, orders, payments, and the commercial records that move deals toward fulfillment."
      description="Use this area for sales-side documents and commercial history. Start with quotes and orders, then move into payments or supporting line-level records when you need more detail."
      links={[
        {
          href: "/admin/quotes",
          label: "Quotes",
          description: "Create and review quote headers for active deal work.",
        },
        {
          href: "/admin/quote-versions",
          label: "Quote Versions",
          description: "Track revisions and generate commercial proposal documents.",
        },
        {
          href: "/admin/orders",
          label: "Orders",
          description: "Manage confirmed commercial commitments and downstream fulfillment context.",
        },
        {
          href: "/admin/payments",
          label: "Payments",
          description: "Record incoming payments and review order payment progress.",
        },
      ]}
    />
  );
}
