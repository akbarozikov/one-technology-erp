"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/lib/entity-config";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="flex flex-col gap-4">
        <Link
          href="/admin"
          className={`rounded px-3 py-2 text-sm ${
            pathname === "/admin"
              ? "bg-zinc-200 font-medium dark:bg-zinc-800"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          }`}
        >
          Dashboard
        </Link>
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded px-3 py-2 text-sm ${
                    pathname === item.href
                      ? "bg-zinc-200 font-medium dark:bg-zinc-800"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
