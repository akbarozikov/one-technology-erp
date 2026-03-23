import { DomainLanding } from "@/components/admin/domain/DomainLanding";

export default function WarehouseLandingPage() {
  return (
    <DomainLanding
      title="Warehouse"
      summary="Manage reservation state, stock movement history, and warehouse operational documents."
      description="This area covers availability context and movement paperwork. Start with reservations and stock movements, then use the document pages for receipts, transfers, counts, adjustments, and writeoffs."
      links={[
        {
          href: "/admin/stock-reservations",
          label: "Stock Reservations",
          description: "Review product reservations tied to quote, order, and configuration context.",
        },
        {
          href: "/admin/stock-movements",
          label: "Stock Movements",
          description: "Inspect warehouse movement history and operational issue records.",
        },
        {
          href: "/admin/stock-balances",
          label: "Stock Balances",
          description: "Check current on-hand, reserved, and available stock figures.",
        },
        {
          href: "/admin/stock-transfer-documents",
          label: "Transfer Documents",
          description: "Open inter-warehouse transfer paperwork and related lines.",
        },
      ]}
    />
  );
}
