"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type SummaryItem = {
  label: string;
  value: string | number;
  hint?: string;
};

export type RelatedItem = {
  key: string | number;
  title: string;
  meta?: string;
  description?: string;
  href?: string;
};

export function DetailSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {item.label}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {item.value}
          </dd>
          {item.hint && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.hint}</p>
          )}
        </div>
      ))}
    </dl>
  );
}

export function RelatedList({
  items,
  emptyMessage,
}: {
  items: RelatedItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {item.title}
            </div>
            {item.meta && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {item.meta}
              </div>
            )}
            {item.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            )}
          </>
        );

        return item.href ? (
          <Link
            key={item.key}
            href={item.href}
            className="block rounded border border-zinc-100 px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            {content}
          </Link>
        ) : (
          <div
            key={item.key}
            className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
