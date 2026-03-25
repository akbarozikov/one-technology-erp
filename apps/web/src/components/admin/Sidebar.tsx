"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAdminMode } from "@/components/admin/AdminModeProvider";
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
  const easyNavItems = easyRole === "boss" ? easyBossNavItems : easySellerNavItems;

  const activeAdvancedGroups = useMemo(
    () =>
      adminNavGroups
        .filter(
          (group) =>
            (group.href && isActivePath(pathname, group.href)) ||
            group.items.some((item) => isActivePath(pathname, item.href))
        )
        .map((group) => group.label),
    [pathname]
  );

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsedGroups((current) => {
      const next = { ...current };
      for (const group of adminNavGroups) {
        if (activeAdvancedGroups.includes(group.label)) {
          next[group.label] = false;
        } else if (!(group.label in next)) {
          next[group.label] = true;
        }
      }
      return next;
    });
  }, [activeAdvancedGroups]);

  function toggleGroup(label: string) {
    setCollapsedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  return (
    <aside className="app-sidebar-panel hidden w-72 shrink-0 lg:flex lg:flex-col xl:w-76">
      <div className="flex h-full flex-col gap-5 p-4 xl:p-5">
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

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
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

              {adminNavGroups.map((group) => {
                const isActiveGroup = activeAdvancedGroups.includes(group.label);
                const collapsed = collapsedGroups[group.label] ?? !isActiveGroup;

                return (
                  <div key={group.label} className={`rounded-[1rem] border ${isActiveGroup ? "border-white/14 bg-white/4" : "border-transparent bg-transparent"}`}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      {group.href ? (
                        <Link
                          href={group.href}
                          className={`flex-1 rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition ${
                            isActiveGroup ? "bg-white/10 text-white/94" : "text-white/42 hover:bg-white/5 hover:text-white/72"
                          }`}
                        >
                          {group.label}
                        </Link>
                      ) : (
                        <div className="app-sidebar-group-label flex-1 px-2">{group.label}</div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                          isActiveGroup ? "text-white/82 hover:bg-white/8" : "text-white/42 hover:bg-white/5 hover:text-white/72"
                        }`}
                        aria-expanded={!collapsed}
                        aria-label={`${collapsed ? "Expand" : "Collapse"} ${group.label}`}
                      >
                        {collapsed ? "+" : "-"}
                      </button>
                    </div>

                    {!collapsed && (
                      <div className="flex flex-col gap-1 px-2 pb-2">
                        {group.items.map((item) => (
                          <Link key={item.href} href={item.href} className={navItemClass(isActivePath(pathname, item.href))}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
