"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  DomainLandingLive,
  type DomainLandingInsights,
} from "@/components/admin/domain/DomainLandingLive";

type StockReservationRow = {
  id: number;
  status: string;
  reservation_reason: string | null;
};

type StockMovementRow = {
  id: number;
  movement_type: string;
  status: string;
  reference_code: string | null;
  movement_date: string | null;
};

type StockBalanceRow = {
  id: number;
  available_qty: number | null;
  reserved_qty: number | null;
};

async function loadWarehouseInsights(): Promise<DomainLandingInsights> {
  const [reservationsRes, movementsRes, balancesRes] = await Promise.all([
    apiGet<{ data: StockReservationRow[] }>("/api/stock-reservations"),
    apiGet<{ data: StockMovementRow[] }>("/api/stock-movements"),
    apiGet<{ data: StockBalanceRow[] }>("/api/stock-balances"),
  ]);

  const reservations = reservationsRes.data ?? [];
  const movements = movementsRes.data ?? [];
  const balances = balancesRes.data ?? [];

  return {
    stats: [
      {
        label: "Active Reservations",
        value: reservations.filter((reservation) => reservation.status === "active").length,
        hint: `${reservations.length} total reservations`,
      },
      {
        label: "Stock Movements",
        value: movements.length,
        hint: `${movements.filter((movement) => movement.status === "posted").length} posted`,
      },
      {
        label: "Stock Balances",
        value: balances.length,
        hint: `${balances.filter((balance) => (balance.reserved_qty ?? 0) > 0).length} reserved positions`,
      },
      {
        label: "Available Rows",
        value: balances.filter((balance) => (balance.available_qty ?? 0) > 0).length,
        hint: "Balance rows with available stock",
      },
    ],
    activityTitle: "Recent Stock Movements",
    activityLinkHref: "/admin/stock-movements",
    activityLinkLabel: "Open movements",
    activityItems: movements.slice(0, 5).map((movement) => ({
      href: "/admin/stock-movements",
      title: movement.reference_code || `Movement ${movement.id}`,
      meta: `${movement.movement_type} · ${movement.status}`,
      description: movement.movement_date
        ? `Movement date: ${movement.movement_date}`
        : "Warehouse movement record",
    })),
    activityEmptyMessage: "No stock movements yet.",
  };
}

export default function WarehouseLandingPage() {
  const loadData = useCallback(() => loadWarehouseInsights(), []);

  return (
    <DomainLandingLive
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
      loadData={loadData}
    />
  );
}
