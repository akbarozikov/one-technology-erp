import Link from "next/link";

export type DomainLandingLink = {
  href: string;
  label: string;
  description: string;
};

export type DomainLandingStat = {
  label: string;
  value: string | number;
  hint?: string;
};

export type DomainLandingActivityItem = {
  href?: string;
  title: string;
  meta?: string;
  description?: string;
};

export function DomainLanding({
  title,
  summary,
  description,
  links,
  statsTitle = "Current State",
  stats,
  insightsLoading = false,
  insightsError = null,
  activityTitle = "Recent Activity",
  activityItems,
  activityEmptyMessage = "No recent activity to show yet.",
  activityLinkHref,
  activityLinkLabel = "View all",
}: {
  title: string;
  summary: string;
  description: string;
  links: DomainLandingLink[];
  statsTitle?: string;
  stats?: DomainLandingStat[];
  insightsLoading?: boolean;
  insightsError?: string | null;
  activityTitle?: string;
  activityItems?: DomainLandingActivityItem[];
  activityEmptyMessage?: string;
  activityLinkHref?: string;
  activityLinkLabel?: string;
}) {
  return (
    <div className="max-w-5xl space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Workspace Guide
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{summary}</p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </section>

      {(insightsLoading ||
        insightsError ||
        (stats && stats.length > 0) ||
        (activityItems && activityItems.length > 0)) && (
        <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {statsTitle}
          </h2>
          {insightsLoading && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Loading current activity...
            </p>
          )}
          {!insightsLoading && insightsError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {insightsError}
            </p>
          )}
          {!insightsLoading && !insightsError && stats && stats.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {stat.value}
                  </p>
                  {stat.hint && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {stat.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Key Pages
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded border border-zinc-200 px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {link.label}
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {(insightsLoading ||
        insightsError ||
        activityItems !== undefined) && (
        <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {activityTitle}
            </h2>
            {activityLinkHref && (
              <Link
                href={activityLinkHref}
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {activityLinkLabel}
              </Link>
            )}
          </div>
          {insightsLoading && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Loading recent updates...
            </p>
          )}
          {!insightsLoading && insightsError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {insightsError}
            </p>
          )}
          {!insightsLoading && !insightsError && activityItems && activityItems.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {activityEmptyMessage}
            </p>
          )}
          {!insightsLoading && !insightsError && activityItems && activityItems.length > 0 && (
            <div className="mt-4 space-y-3">
              {activityItems.map((item, index) => {
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
                    key={`${item.title}-${index}`}
                    href={item.href}
                    className="block rounded border border-zinc-100 px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
