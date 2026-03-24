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

export type ActionItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  helperText?: string;
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
  emptyAction,
}: {
  items: RelatedItem[];
  emptyMessage: string;
  emptyAction?: ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
        {emptyAction && <div className="mt-3">{emptyAction}</div>}
      </div>
    );
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

export function AttentionList({
  items,
}: {
  items: Array<{ key: string; title: string; description: string }>;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        Nothing urgent stands out right now. This record looks ready to continue normally.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40"
        >
          <div className="font-medium text-amber-950 dark:text-amber-100">
            {item.title}
          </div>
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ActionGroup({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: ActionItem[];
}) {
  return (
    <div className="rounded border border-zinc-100 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => {
          const className = item.primary
            ? "rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            : "rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";

          const helper = item.helperText ? (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{item.helperText}</p>
          ) : null;

          if (item.href) {
            return (
              <div key={item.key}>
                <Link href={item.href} className={className} aria-disabled={item.disabled}>
                  {item.label}
                </Link>
                {helper}
              </div>
            );
          }

          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={className}
              >
                {item.label}
              </button>
              {helper}
            </div>
          );
        })}
      </div>
    </div>
  );
}
