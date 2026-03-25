"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminModeProvider, useAdminMode } from "@/components/admin/AdminModeProvider";
import { easyBossNavItems, easySellerNavItems } from "@/lib/entity-config";

function isModeNavPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, easyRole, setEasyRole, ready } = useAdminMode();
  const easyNavItems = easyRole === "boss" ? easyBossNavItems : easySellerNavItems;

  const isEasyModePage = easyNavItems.some((item) => isModeNavPath(pathname, item.href));

  return (
    <div className="flex min-h-screen flex-1">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {mode === "easy" ? "Easy Mode" : "Advanced Mode"}
              </p>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {mode === "easy"
                  ? easyRole === "boss"
                    ? "One Technology ERP Boss Workspace"
                    : "One Technology ERP Seller Workspace"
                  : "One Technology ERP Advanced Workspace"}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "easy"
                  ? easyRole === "boss"
                    ? "A management control surface for decisions, oversight, and the next actions that matter today."
                    : "A simpler working view for everyday sales, documents, approvals, and installations."
                  : "Full ERP access for detailed commercial, warehouse, constructor, and administration work."}
              </p>
              {mode === "easy" && !isEasyModePage && (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  Easy mode is active. You are viewing an advanced ERP page that stays available
                  when deeper control is needed.
                </p>
              )}
            </div>

            <div className="rounded border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                View Mode
              </div>
              <div className="flex gap-1">
                {(["easy", "advanced"] as const).map((option) => {
                  const active = mode === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMode(option)}
                      className={`rounded px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                      aria-pressed={active}
                    >
                      {option === "easy" ? "Easy" : "Advanced"}
                    </button>
                  );
                })}
              </div>
              {!ready && (
                <p className="px-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Loading saved preference...
                </p>
              )}
            </div>
            {mode === "easy" && (
              <div className="rounded border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Easy Role
                </div>
                <div className="flex gap-1">
                  {(["seller", "boss"] as const).map((option) => {
                    const active = easyRole === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEasyRole(option)}
                        className={`rounded px-3 py-1.5 text-sm transition ${
                          active
                            ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                        aria-pressed={active}
                      >
                        {option === "seller" ? "Seller" : "Boss"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminModeProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminModeProvider>
  );
}
