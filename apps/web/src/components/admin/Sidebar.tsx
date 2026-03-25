"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminMode } from "@/components/admin/AdminModeProvider";
import { adminNavGroups, easyBossNavItems, easySellerNavItems } from "@/lib/entity-config";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { mode, easyRole } = useAdminMode();
  const easyNavItems = easyRole === "boss" ? easyBossNavItems : easySellerNavItems;

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="flex flex-col gap-4">
        {mode === "easy" ? (
          <>
            <div>
              <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {easyRole === "boss" ? "Boss Workspace" : "Seller Workspace"}
              </div>
              <div className="flex flex-col gap-1">
                {easyNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded px-3 py-2 text-sm ${
                      isActivePath(pathname, item.href)
                        ? "bg-zinc-200 font-medium dark:bg-zinc-800"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded border border-dashed border-zinc-300 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              Need deeper control?
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Switch to Advanced mode for warehouse structure, constructor tools, detailed entity
                records, and administration pages.
              </p>
            </div>
          </>
        ) : (
          <>
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
                {group.href ? (
                  <Link
                    href={group.href}
                    className={`mb-1 block rounded px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      isActivePath(pathname, group.href)
                        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {group.label}
                  </Link>
                ) : (
                  <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    {group.label}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded px-3 py-2 text-sm ${
                        isActivePath(pathname, item.href)
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
          </>
        )}
      </nav>
    </aside>
  );
}
