"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { type Sale, getSaleStatusTone, formatMoney } from "@/lib/easy-sales";

function Badge({ value }: { value: Sale["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${getSaleStatusTone(value)}`}
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
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {sale.client}
          </div>
          {sale.seller && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{sale.seller}</p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Badge value={sale.status} />
          {extraBadge && (
            <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {extraBadge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Product / Solution
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {sale.product}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Amount
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {formatMoney(sale.amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Updated
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {sale.updatedAt || "-"}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </>
  );

  const cardClassName =
    "block rounded border border-zinc-200 bg-white p-4 shadow-sm transition dark:border-zinc-700 dark:bg-zinc-900";

  if (href) {
    return (
      <Link href={href} className={`${cardClassName} hover:bg-zinc-50 dark:hover:bg-zinc-800`}>
        {cardBody}
      </Link>
    );
  }

  return <div className={cardClassName}>{cardBody}</div>;
}
