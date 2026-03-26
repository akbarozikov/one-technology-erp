"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAdminMode } from "@/components/admin/AdminModeProvider";
import { useAuth } from "@/components/admin/AuthProvider";
import { canAccessHref } from "@/lib/auth/permissions";
import { adminNavGroups, easyBossNavItems, easySellerNavItems } from "@/lib/entity-config";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(active: boolean): string {
  return active ? "app-sidebar-link app-sidebar-link-active" : "app-sidebar-link";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { mode, easyRole } = useAdminMode();
  const { permissions } = useAuth();
  const easyNavItems = useMemo(
    () =>
      (easyRole === "boss" ? easyBossNavItems : easySellerNavItems).filter((item) =>
        canAccessHref(permissions, item.href)
      ),
    [easyRole, permissions]
  );
  const visibleAdvancedGroups = useMemo(
    () =>
      adminNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccessHref(permissions, item.href)),
        }))
        .filter((group) => (group.href ? canAccessHref(permissions, group.href) : true) || group.items.length > 0),
    [permissions]
  );

  const activeAdvancedGroups = useMemo(
    () =>
      visibleAdvancedGroups
        .filter(
          (group) =>
            (group.href && isActivePath(pathname, group.href)) ||
            group.items.some((item) => isActivePath(pathname, item.href))
        )
        .map((group) => group.label),
    [pathname, visibleAdvancedGroups]
  );

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsedGroups((current) => {
      const next = { ...current };
      for (const group of visibleAdvancedGroups) {
        if (activeAdvancedGroups.includes(group.label)) {
          next[group.label] = false;
        } else if (!(group.label in next)) {
          next[group.label] = true;
        }
      }
      return next;
    });
  }, [activeAdvancedGroups, visibleAdvancedGroups]);

  function toggleGroup(label: string) {
    setCollapsedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  return (
    <aside className="app-sidebar-panel hidden w-72 shrink-0 lg:flex lg:flex-col xl:w-76">
      <div className="flex h-full flex-col gap-4 p-4 xl:p-5">
        <div className="rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4 backdrop-blur-sm">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            One Technology ERP
          </div>
          <div className="mt-2 text-lg font-semibold text-white/95">
            {mode === "easy"
              ? easyRole === "boss"
                ? "Boss control"
                : "Seller workspace"
              : "Advanced ERP"}
          </div>
          <p className="mt-2 text-sm leading-6 text-white/58">
            {mode === "easy"
              ? easyRole === "boss"
                ? "Daily decisions, oversight, and follow-through."
                : "Simple selling surfaces with deeper tools still available when needed."
              : "Detailed commercial, warehouse, constructor, document, and admin control."}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
          {mode === "easy" ? (
            <>
              <div>
                <div className="app-sidebar-group-label mb-2 px-2">
                  {easyRole === "boss" ? "Boss workspace" : "Seller workspace"}
                </div>
                <div className="flex flex-col gap-1">
                  {easyNavItems.map((item) => (
                    <Link key={item.href} href={item.href} className={navItemClass(isActivePath(pathname, item.href))}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/4 px-4 py-4 text-sm text-white/70">
                <div className="font-medium text-white/90">Need deeper control?</div>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Switch to Advanced mode for warehouse structure, detailed entity records, lifecycle tools, and administration pages.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="app-sidebar-group-label mb-2 px-2">Overview</div>
                <Link href="/admin" className={navItemClass(pathname === "/admin")}>
                  Dashboard
                </Link>
              </div>

              <div className="app-sidebar-group-label px-2">Business areas</div>

              {visibleAdvancedGroups.map((group) => {
                const isActiveGroup = activeAdvancedGroups.includes(group.label);
                const collapsed = collapsedGroups[group.label] ?? !isActiveGroup;

                return (
                  <section
                    key={group.label}
                    className={`rounded-[1rem] border transition ${
                      isActiveGroup
                        ? "border-white/14 bg-white/5 shadow-[inset_0_1px_0_rgba(255,248,236,0.05)]"
                        : "border-transparent bg-transparent hover:border-white/5 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-2 py-2">
                      {group.href ? (
                        <Link
                          href={group.href}
                          className={`min-w-0 flex-1 rounded-[0.85rem] px-2.5 py-2 text-sm font-semibold transition ${
                            isActiveGroup
                              ? "bg-white/10 text-white/96"
                              : "text-white/62 hover:bg-white/4 hover:text-white/88"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate">{group.label}</span>
                            <span className="rounded-full border border-white/8 px-2 py-0.5 text-[11px] font-medium text-white/40">
                              {group.items.length}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[0.85rem] px-2.5 py-2 text-sm font-semibold text-white/86">
                          <span className="truncate">{group.label}</span>
                          <span className="rounded-full border border-white/8 px-2 py-0.5 text-[11px] font-medium text-white/40">
                            {group.items.length}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition ${
                          isActiveGroup
                            ? "text-white/82 hover:bg-white/8"
                            : "text-white/36 hover:bg-white/4 hover:text-white/68"
                        }`}
                        aria-expanded={!collapsed}
                        aria-label={`${collapsed ? "Expand" : "Collapse"} ${group.label}`}
                      >
                        {collapsed ? "+" : "-"}
                      </button>
                    </div>

                    {!collapsed && (
                      <div className="space-y-2 px-2 pb-2">
                        <div className="border-t border-white/8" />
                        <div className="flex flex-col gap-1">
                          {group.items.map((item) => (
                            <Link key={item.href} href={item.href} className={navItemClass(isActivePath(pathname, item.href))}>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}


