import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        One Technology ERP
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Internal ERP. Use the admin area for Phase 1 setup (roles, org structure,
        warehouses).
      </p>
      <Link
        href="/admin"
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Open admin
      </Link>
    </div>
  );
}
