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
    <section className="app-panel p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h2 className="app-section-title">{title}</h2>
          {description && <p className="app-section-subtitle">{description}</p>}
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
        <div key={item.label} className="app-panel-muted px-4 py-4">
          <dt className="app-kicker">{item.label}</dt>
          <dd className="mt-2 text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {item.value}
          </dd>
          {item.hint && <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.hint}</p>}
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
      <div className="app-empty">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{emptyMessage}</p>
        {emptyAction && <div className="mt-3">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{item.title}</div>
            {item.meta && <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.meta}</div>}
            {item.description && <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p>}
          </>
        );

        return item.href ? (
          <Link key={item.key} href={item.href} className="app-panel-muted block px-4 py-4 transition hover:-translate-y-0.5 hover:border-black/12 dark:hover:border-white/12">
            {content}
          </Link>
        ) : (
          <div key={item.key} className="app-panel-muted px-4 py-4">
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
      <div className="rounded-[1.2rem] border border-emerald-200/70 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
        Nothing urgent stands out right now. This record looks ready to continue normally.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="rounded-[1.2rem] border border-amber-200/80 bg-amber-50/85 px-4 py-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="text-sm font-semibold text-amber-950 dark:text-amber-100">{item.title}</div>
          <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">{item.description}</p>
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
    <div className="app-panel-muted px-4 py-4">
      <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{title}</h3>
      {description && <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {items.map((item) => {
          const className = item.primary ? "app-button-primary" : "app-button-secondary";
          const helper = item.helperText ? <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.helperText}</p> : null;

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
              <button type="button" onClick={item.onClick} disabled={item.disabled} className={className}>
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
