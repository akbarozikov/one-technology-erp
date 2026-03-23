import Link from "next/link";

type DomainLandingLink = {
  href: string;
  label: string;
  description: string;
};

export function DomainLanding({
  title,
  summary,
  description,
  links,
}: {
  title: string;
  summary: string;
  description: string;
  links: DomainLandingLink[];
}) {
  return (
    <div className="max-w-5xl space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Domain Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{summary}</p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </section>

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
    </div>
  );
}
