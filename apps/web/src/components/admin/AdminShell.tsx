"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminModeProvider, useAdminMode } from "@/components/admin/AdminModeProvider";
import { AuthProvider, useAuth } from "@/components/admin/AuthProvider";
import {
  canAccessHref,
  canUseBossWorkspace,
  canUseSellerWorkspace,
} from "@/lib/auth/permissions";
import type { AuthSession } from "@/lib/auth/shared";
import { easyBossNavItems, easySellerNavItems } from "@/lib/entity-config";

function isModeNavPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, easyRole, setEasyRole, ready } = useAdminMode();
  const { session, logout, loggingOut } = useAuth();
  const easyNavItems = easyRole === "boss" ? easyBossNavItems : easySellerNavItems;
  const canUseSeller = canUseSellerWorkspace(session.permissions);
  const canUseBoss = canUseBossWorkspace(session.permissions);
  const canViewCurrentPath = canAccessHref(session.permissions, pathname);
  const availableEasyRoles = useMemo(
    () =>
      ([canUseSeller ? "seller" : null, canUseBoss ? "boss" : null].filter(Boolean) as Array<
        "seller" | "boss"
      >),
    [canUseBoss, canUseSeller]
  );

  const isEasyModePage = easyNavItems.some((item) => isModeNavPath(pathname, item.href));

  useEffect(() => {
    if (mode !== "easy") {
      return;
    }
    if (easyRole === "seller" && canUseSeller) {
      return;
    }
    if (easyRole === "boss" && canUseBoss) {
      return;
    }

    const fallbackRole = availableEasyRoles[0];
    if (fallbackRole) {
      setEasyRole(fallbackRole);
    } else {
      setMode("advanced");
    }
  }, [availableEasyRoles, canUseBoss, canUseSeller, easyRole, mode, setEasyRole, setMode]);

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
                {session.bootstrapAccess && (
                  <span className="app-chip app-badge-warning">Bootstrap admin access</span>
                )}
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
                {session.bootstrapAccess && (
                  <div className="app-panel-muted max-w-3xl px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                    Bootstrap admin recovery is active for this session. Use it to repair users,
                    roles, permissions, and assignments, then disable the bootstrap env flag once a
                    real admin role setup is in place.
                  </div>
                )}
                {mode === "easy" && !isEasyModePage && (
                  <div className="app-panel-muted max-w-3xl px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                    Easy mode is active, but this page belongs to the advanced workspace. That is intentional when you need deeper control than the simplified product layer exposes.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[31rem]">
              <section className="app-panel px-3 py-3">
                <div className="app-kicker mb-2 px-1">Signed in</div>
                <div className="px-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{session.name}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{session.identifier}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  disabled={loggingOut}
                  className="app-button-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? "Signing out..." : "Log out"}
                </button>
              </section>

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

              {mode === "easy" && availableEasyRoles.length > 0 && (
                <section className="app-panel px-3 py-3 sm:col-span-2 xl:col-span-1">
                  <div className="app-kicker mb-2 px-1">Role</div>
                  <div className={`grid gap-2 ${availableEasyRoles.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {availableEasyRoles.map((option) => {
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

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          {canViewCurrentPath ? (
            children
          ) : (
            <section className="app-panel p-6 lg:p-7">
              <div className="max-w-2xl space-y-3">
                <p className="app-kicker">Access limited</p>
                <h1 className="app-section-title text-[1.4rem]">
                  You do not have permission to open this workspace.
                </h1>
                <p className="app-section-subtitle">
                  Your signed-in roles do not include the capability required for this page. Switch
                  to another allowed area, or ask an administrator to update your role assignments.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({
  session,
  children,
}: {
  session: AuthSession;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider initialSession={session}>
      <AdminModeProvider
        defaultMode={session.preferredMode ?? "easy"}
        defaultEasyRole={session.preferredEasyRole ?? "seller"}
      >
        <AdminShellInner>{children}</AdminShellInner>
      </AdminModeProvider>
    </AuthProvider>
  );
}
