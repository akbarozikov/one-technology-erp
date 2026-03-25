"use client";

import Link from "next/link";

function badgeTone(value: string): string {
  const normalized = value.toLowerCase();

  if (
    [
      "active",
      "accepted",
      "paid",
      "completed",
      "generated",
      "ready_for_fulfillment",
    ].includes(normalized)
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  }

  if (
    [
      "draft",
      "prepared",
      "sent",
      "scheduled",
      "pending",
      "partially_paid",
      "awaiting_payment",
    ].includes(normalized)
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  }

  if (["cancelled", "failed", "rejected", "expired"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeTone(
        value
      )}`}
    >
      {value}
    </span>
  );
}

export function EasySalesCard({
  href,
  title,
  customer,
  itemLabel,
  amount,
  updatedLabel,
  description,
  primaryStatus,
  secondaryStatus,
}: {
  href: string;
  title: string;
  customer?: string | null;
  itemLabel?: string | null;
  amount?: string | null;
  updatedLabel?: string | null;
  description?: string | null;
  primaryStatus: string;
  secondaryStatus?: string | null;
}) {
  return (
    <Link
      href={href}
      className="block rounded border border-zinc-200 bg-white p-4 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
          {customer && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{customer}</p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Badge value={primaryStatus} />
          {secondaryStatus && <Badge value={secondaryStatus} />}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Product / Solution
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {itemLabel || "Open record for details"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Amount
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{amount || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Updated
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            {updatedLabel || "-"}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </Link>
  );
}
