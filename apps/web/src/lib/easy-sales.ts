"use client";

import type { EasyApprovalDecision, EasyApprovalRecord } from "@/lib/easy-approvals";

export function extractClientName(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/Client:\s*(.+)/i);
  return match?.[1]?.trim() || null;
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

export type SaleStatus = "Pending" | "Needs changes" | "Approved" | "Rejected";

export type Sale = {
  id: number;
  client: string;
  product: string;
  amount: number | null;
  status: SaleStatus;
  updatedAt: string | null;
  seller: string | null;
  detailHref: string;
  advancedHref: string;
  stageLabel: string | null;
  decision: EasyApprovalDecision | null;
  decisionComment: string | null;
};

export type SaleQuoteRow = {
  id: number;
  quote_number: string;
  notes: string | null;
  status?: string;
  updated_at?: string | null;
  created_by_user_id?: number | null;
};

export type SaleQuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: string;
  grand_total: number | null;
  notes: string | null;
  updated_at?: string | null;
  created_by_user_id?: number | null;
};

export type SaleQuoteLineRow = {
  id: number;
  quote_version_id: number;
  snapshot_product_name: string | null;
};

export type SaleOrderRow = {
  id: number;
  quote_version_id: number | null;
  order_number: string;
  order_status: string;
  payment_status?: string;
  grand_total: number | null;
  paid_total?: number | null;
  remaining_total?: number | null;
  order_date?: string | null;
  notes: string | null;
  updated_at?: string | null;
};

export type SaleOrderLineRow = {
  id: number;
  order_id: number;
  snapshot_product_name: string | null;
};

export type SaleUserRow = {
  id: number;
  email: string;
  phone: string | null;
};

export type SalePaymentRow = {
  id: number;
  order_id: number;
  amount: number | null;
  payment_date: string | null;
  status: string;
  reference_number: string | null;
  updated_at?: string | null;
};

type BuildSalesInput = {
  quotes: SaleQuoteRow[];
  quoteVersions: SaleQuoteVersionRow[];
  quoteLines: SaleQuoteLineRow[];
  orders: SaleOrderRow[];
  orderLines: SaleOrderLineRow[];
  users?: SaleUserRow[];
  approvalRecords?: Record<string, EasyApprovalRecord>;
};

export function getSaleStatusTone(status: SaleStatus): string {
  if (status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  }
  if (status === "Needs changes") {
    return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200";
  }
  return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
}

export function getSaleStatusFromDecision(decision: EasyApprovalDecision | null): SaleStatus | null {
  if (decision === "approve") return "Approved";
  if (decision === "send_back") return "Needs changes";
  if (decision === "reject") return "Rejected";
  return null;
}

export function normalizeSaleStatus(args: {
  decision: EasyApprovalDecision | null;
  versionStatus?: string | null;
  orderStatus?: string | null;
  paymentStatus?: string | null;
}): SaleStatus {
  const decisionStatus = getSaleStatusFromDecision(args.decision);
  if (decisionStatus) return decisionStatus;

  const versionStatus = args.versionStatus?.toLowerCase() ?? "";
  const orderStatus = args.orderStatus?.toLowerCase() ?? "";
  const paymentStatus = args.paymentStatus?.toLowerCase() ?? "";

  if (
    ["rejected", "cancelled", "expired"].includes(versionStatus) ||
    ["cancelled"].includes(orderStatus)
  ) {
    return "Rejected";
  }

  if (["draft"].includes(versionStatus)) {
    return "Needs changes";
  }

  if (
    ["accepted"].includes(versionStatus) ||
    ["completed"].includes(orderStatus) ||
    ["paid"].includes(paymentStatus)
  ) {
    return "Approved";
  }

  return "Pending";
}

function fallbackClient(quoteId: number): string {
  return `Client ${quoteId}`;
}

function fallbackProduct(saleId: number): string {
  return `Sale item ${saleId}`;
}

function sellerLabel(user: SaleUserRow | undefined): string | null {
  if (!user) return null;
  return user.email || user.phone || null;
}

export function buildSales(input: BuildSalesInput): Sale[] {
  const quoteById = new Map(input.quotes.map((quote) => [quote.id, quote]));
  const firstQuoteLineByVersion = new Map<number, SaleQuoteLineRow>();
  for (const line of input.quoteLines) {
    if (!firstQuoteLineByVersion.has(line.quote_version_id)) {
      firstQuoteLineByVersion.set(line.quote_version_id, line);
    }
  }

  const orderByQuoteVersionId = new Map<number, SaleOrderRow>();
  for (const order of input.orders) {
    if (order.quote_version_id !== null && !orderByQuoteVersionId.has(order.quote_version_id)) {
      orderByQuoteVersionId.set(order.quote_version_id, order);
    }
  }

  const firstOrderLineByOrder = new Map<number, SaleOrderLineRow>();
  for (const line of input.orderLines) {
    if (!firstOrderLineByOrder.has(line.order_id)) {
      firstOrderLineByOrder.set(line.order_id, line);
    }
  }

  const userById = new Map((input.users ?? []).map((user) => [user.id, user]));
  const approvalRecords = input.approvalRecords ?? {};

  return input.quoteVersions.map((version) => {
    const quote = quoteById.get(version.quote_id);
    const linkedOrder = orderByQuoteVersionId.get(version.id);
    const firstQuoteLine = firstQuoteLineByVersion.get(version.id);
    const firstOrderLine = linkedOrder ? firstOrderLineByOrder.get(linkedOrder.id) : undefined;
    const decisionRecord = approvalRecords[String(version.id)] ?? null;
    const sellerId = version.created_by_user_id ?? quote?.created_by_user_id ?? null;
    const seller = sellerId !== null ? sellerLabel(userById.get(sellerId)) : null;
    const client =
      extractClientName(version.notes) ||
      extractClientName(quote?.notes) ||
      extractClientName(linkedOrder?.notes) ||
      fallbackClient(version.quote_id);
    const product =
      firstOrderLine?.snapshot_product_name ||
      firstQuoteLine?.snapshot_product_name ||
      fallbackProduct(version.id);
    const amount = linkedOrder?.grand_total ?? version.grand_total ?? null;
    const updatedAt = linkedOrder?.updated_at || version.updated_at || quote?.updated_at || null;
    const stageLabel = linkedOrder ? "Order follow-through" : "Sale in progress";
    const decision = decisionRecord?.decision ?? null;

    return {
      id: version.id,
      client,
      product,
      amount,
      status: normalizeSaleStatus({
        decision,
        versionStatus: version.version_status,
        orderStatus: linkedOrder?.order_status,
        paymentStatus: linkedOrder?.payment_status,
      }),
      updatedAt,
      seller,
      detailHref: `/admin/approvals/${version.id}`,
      advancedHref: linkedOrder ? `/admin/orders/${linkedOrder.id}` : `/admin/quote-versions/${version.id}`,
      stageLabel,
      decision,
      decisionComment: decisionRecord?.comment ?? null,
    } satisfies Sale;
  });
}
