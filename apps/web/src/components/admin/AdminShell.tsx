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
    <div className="app-shell-bg flex min-h-screen flex-1">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <header className="border-b border-black/5 bg-white/55 px-5 py-5 backdrop-blur-xl dark:border-white/8 dark:bg-black/10 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="app-chip">
                  {mode === "easy" ? "Easy mode" : "Advanced mode"}
                </span>
                {mode === "easy" && (
                  <span className="app-chip">
                    {easyRole === "boss" ? "Boss workspace" : "Seller workspace"}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="app-page-title max-w-4xl text-[1.9rem] lg:text-[2.25rem]">
                  {mode === "easy"
                    ? easyRole === "boss"
                      ? "Control the day, not the database."
                      : "Keep sales moving without the ERP noise."
                    : "Advanced workspace for the full operating system."}
                </h1>
                <p className="app-page-subtitle">
                  {mode === "easy"
                    ? easyRole === "boss"
                      ? "Decisions, money, documents, and operational exceptions are grouped here so management work feels direct and calm."
                      : "Daily selling, follow-through, and customer-facing progress stay simple here, while the deeper ERP tools remain one step away."
                    : "Commercial, warehouse, constructor, document, and administration depth all stay available here, now with cleaner structure and denser visual rhythm."}
                </p>
                {mode === "easy" && !isEasyModePage && (
                  <div className="app-panel-muted max-w-3xl px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                    Easy mode is active, but this page belongs to the advanced workspace. That is intentional when you need deeper control than the simplified product layer exposes.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[25rem]">
              <section className="app-panel px-3 py-3">
                <div className="app-kicker mb-2 px-1">View</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["easy", "advanced"] as const).map((option) => {
                    const active = mode === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMode(option)}
                        className={active ? "app-button-primary w-full" : "app-button-secondary w-full"}
                        aria-pressed={active}
                      >
                        {option === "easy" ? "Easy" : "Advanced"}
                      </button>
                    );
                  })}
                </div>
                {!ready && (
                  <p className="mt-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Loading saved preference...
                  </p>
                )}
              </section>

              {mode === "easy" && (
                <section className="app-panel px-3 py-3">
                  <div className="app-kicker mb-2 px-1">Role</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["seller", "boss"] as const).map((option) => {
                      const active = easyRole === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setEasyRole(option)}
                          className={active ? "app-button-primary w-full" : "app-button-secondary w-full"}
                          aria-pressed={active}
                        >
                          {option === "seller" ? "Seller" : "Boss"}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
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
