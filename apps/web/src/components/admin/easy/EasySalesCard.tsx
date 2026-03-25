"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { type Sale, getSaleStatusTone, formatMoney } from "@/lib/easy-sales";

function Badge({ value }: { value: Sale["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getSaleStatusTone(value)}`}
    >
      {value}
    </span>
  );
}

export function EasySalesCard({
  sale,
  href,
  description,
  extraBadge,
  actions,
}: {
  sale: Sale;
  href?: string;
  description?: string | null;
  extraBadge?: string | null;
  actions?: ReactNode;
}) {
  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {sale.client}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sale.seller && <span className="app-chip">{sale.seller}</span>}
            {sale.stageLabel && <span className="app-chip">{sale.stageLabel}</span>}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge value={sale.status} />
          {extraBadge && <span className="app-chip">{extraBadge}</span>}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="app-panel-muted px-3 py-3">
          <p className="app-kicker">Product</p>
          <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">{sale.product}</p>
        </div>
        <div className="app-panel-muted px-3 py-3">
          <p className="app-kicker">Amount</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            {formatMoney(sale.amount)}
          </p>
        </div>
        <div className="app-panel-muted px-3 py-3">
          <p className="app-kicker">Updated</p>
          <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">{sale.updatedAt || "-"}</p>
        </div>
      </div>

      {description && (
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      )}

      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </>
  );

  const cardClassName =
    "app-panel block p-5 transition duration-150 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_18px_36px_rgba(17,24,39,0.08)] dark:hover:border-white/12";

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {cardBody}
      </Link>
    );
  }

  return <div className={cardClassName}>{cardBody}</div>;
}
