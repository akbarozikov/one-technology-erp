"use client";

import { extractClientName, type Sale, type SaleOrderRow, type SalePaymentRow } from "@/lib/easy-sales";

export type PaymentDebtStatus =
  | "Outstanding"
  | "Overdue"
  | "Partially paid"
  | "Paid"
  | "Needs attention";

export type PaymentDebtItem = {
  id: number;
  client: string;
  relatedSale: string;
  totalAmount: number | null;
  paidAmount: number | null;
  remainingAmount: number | null;
  status: PaymentDebtStatus;
  dueDate: string | null;
  updatedAt: string | null;
  advancedHref: string;
  paymentStatus: string | null;
};

type BuildPaymentDebtInput = {
  orders: SaleOrderRow[];
  sales: Sale[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isOverdue(dueDate: string | null, remainingAmount: number | null): boolean {
  if (!dueDate || !remainingAmount || remainingAmount <= 0) return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const overdueThreshold = startOfDay(new Date());
  overdueThreshold.setDate(overdueThreshold.getDate() - 7);
  return due < overdueThreshold;
}

export function paymentDebtTone(status: PaymentDebtStatus): string {
  if (status === "Paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (status === "Overdue") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  }
  if (status === "Needs attention") {
    return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200";
  }
  if (status === "Partially paid") {
    return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200";
  }
  return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
}

export function buildPaymentDebtItems(input: BuildPaymentDebtInput): PaymentDebtItem[] {
  const saleByQuoteVersionId = new Map(input.sales.map((sale) => [sale.id, sale]));

  return input.orders.map((order) => {
    const sale = order.quote_version_id !== null ? saleByQuoteVersionId.get(order.quote_version_id) : undefined;
    const client =
      sale?.client ||
      extractClientName(order.notes) ||
      (order.quote_version_id !== null ? `Client ${order.quote_version_id}` : `Client ${order.id}`);
    const relatedSale =
      sale ? `${sale.client} - ${sale.product}` : order.order_number || `Sale ${order.id}`;
    const totalAmount = order.grand_total ?? null;
    const paidAmount = order.paid_total ?? null;
    const remainingAmount = order.remaining_total ?? null;
    const overdue = isOverdue(order.order_date ?? null, remainingAmount);
    const highValueOutstanding = (remainingAmount ?? 0) >= 1000;

    let status: PaymentDebtStatus;
    if ((remainingAmount ?? 0) <= 0 || order.payment_status === "paid") {
      status = "Paid";
    } else if (overdue) {
      status = "Overdue";
    } else if (order.payment_status === "partially_paid") {
      status = "Partially paid";
    } else if (highValueOutstanding) {
      status = "Needs attention";
    } else {
      status = "Outstanding";
    }

    return {
      id: order.id,
      client,
      relatedSale,
      totalAmount,
      paidAmount,
      remainingAmount,
      status,
      dueDate: order.order_date ?? null,
      updatedAt: order.updated_at || order.order_date || null,
      advancedHref: `/admin/orders/${order.id}`,
      paymentStatus: order.payment_status ?? null,
    };
  });
}

export type RecentPaymentRow = SalePaymentRow;
