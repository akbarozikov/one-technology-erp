"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminMode } from "@/components/admin/AdminModeProvider";
import { useAuth } from "@/components/admin/AuthProvider";
import { canAccessHref } from "@/lib/auth/permissions";
import { adminNavGroups, easyBossNavItems, easySellerNavItems } from "@/lib/entity-config";

const SIDEBAR_COLLAPSED_KEY = "ot-erp-sidebar-collapsed";

type NavIconKey =
  | "dashboard"
  | "sales"
  | "approvals"
  | "payments"
  | "operations"
  | "documents"
  | "installations"
  | "catalog"
  | "constructor"
  | "admin";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(active: boolean): string {
  return active ? "app-sidebar-link app-sidebar-link-active" : "app-sidebar-link";
}

function iconForHref(href: string): NavIconKey {
  if (href === "/admin") return "dashboard";
  if (["/admin/new-sale", "/admin/my-sales", "/admin/commercial", "/admin/quotes", "/admin/quote-versions", "/admin/orders"].some((prefix) => href.startsWith(prefix))) {
    return "sales";
  }
  if (href.startsWith("/admin/approvals")) return "approvals";
  if (href.startsWith("/admin/payments-debt") || href.startsWith("/admin/payments") || href.startsWith("/admin/payment-methods")) return "payments";
  if (href.startsWith("/admin/warehouse") || href.startsWith("/admin/stock-") || href.startsWith("/admin/expenses-adjustments") || href.startsWith("/admin/purchase-receipts") || href.startsWith("/admin/warehouses") || href.startsWith("/admin/warehouse-positions")) return "operations";
  if (href.startsWith("/admin/documents") || href.startsWith("/admin/generated-documents") || href.startsWith("/admin/document-")) return "documents";
  if (href.startsWith("/admin/installation")) return "installations";
  if (href.startsWith("/admin/catalog") || href.startsWith("/admin/products") || href.startsWith("/admin/product-") || href.startsWith("/admin/suppliers") || href.startsWith("/admin/units")) return "catalog";
  if (href.startsWith("/admin/constructor") || href.startsWith("/admin/door-configuration") || href.startsWith("/admin/bom-") || href.startsWith("/admin/calculation-runs") || href.startsWith("/admin/spring-calculation-results")) return "constructor";
  return "admin";
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <rect x="3" y="3" width="5.5" height="5.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="3" width="5.5" height="8" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="13.5" width="5.5" height="3.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M4 14.5 8 10.5l3 2.5 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 7H16v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApprovalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M5 10.5 8.2 13.7 15 6.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <rect x="3" y="5" width="14" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.25 9.2c0-.66.64-1.2 1.75-1.2s1.75.54 1.75 1.2c0 1.6-3.5.85-3.5 2.4 0 .66.64 1.2 1.75 1.2s1.75-.54 1.75-1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M4 14.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 14.5V8.5l4.5-3 4.5 3v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M6 3.5h5.8L15 6.7V15a2 2 0 0 1-2 2H6.9A1.9 1.9 0 0 1 5 15.1V5.4A1.9 1.9 0 0 1 6.9 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.5 3.8V7H14.7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function InstallationIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M7 5.5h6M6 10h8M8 14.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="4" y="3.5" width="12" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M4.5 6.5 10 3.5l5.5 3v7L10 16.5l-5.5-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 9.2 15.2 6.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 9.2v7.1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ConstructorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <path d="M6 5.5h8M6 10h8M6 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13.75" cy="14.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
      <circle cx="10" cy="10" r="2.35" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 4.2v1.3M10 14.5v1.3M15.8 10h-1.3M5.5 10H4.2M14.1 5.9l-.9.9M6.8 13.2l-.9.9M14.1 14.1l-.9-.9M6.8 6.8l-.9-.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({ kind }: { kind: NavIconKey }) {
  switch (kind) {
    case "dashboard":
      return <DashboardIcon />;
    case "sales":
      return <SalesIcon />;
    case "approvals":
      return <ApprovalIcon />;
    case "payments":
      return <MoneyIcon />;
    case "operations":
      return <OperationsIcon />;
    case "documents":
      return <DocumentIcon />;
    case "installations":
      return <InstallationIcon />;
    case "catalog":
      return <CatalogIcon />;
    case "constructor":
      return <ConstructorIcon />;
    default:
      return <AdminIcon />;
  }
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { mode, easyRole } = useAdminMode();
  const { permissions } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedContentReady, setExpandedContentReady] = useState(true);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const collapsedRailItems = useMemo(() => {
    if (mode === "easy") {
      return easyNavItems.map((item) => ({
        href: item.href,
        label: item.label,
        icon: iconForHref(item.href),
        active: isActivePath(pathname, item.href),
      }));
    }

    return [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "dashboard" as const,
        active: pathname === "/admin",
      },
      ...visibleAdvancedGroups.map((group) => {
        const href = group.href ?? group.items[0]?.href ?? "/admin";
        return {
          href,
          label: group.label,
          icon: iconForHref(href),
          active:
            (group.href && isActivePath(pathname, group.href)) ||
            group.items.some((item) => isActivePath(pathname, item.href)),
        };
      }),
    ];
  }, [easyNavItems, mode, pathname, visibleAdvancedGroups]);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      setCollapsed(false);
    }
  }, []);

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

  useEffect(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (collapsed) {
      setExpandedContentReady(false);
      return;
    }

    setExpandedContentReady(false);
    revealTimerRef.current = setTimeout(() => {
      setExpandedContentReady(true);
      revealTimerRef.current = null;
    }, 130);

    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [collapsed]);

  function toggleGroup(label: string) {
    setCollapsedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore persistence failures.
      }
      return next;
    });
  }

  const showExpandedContent = !collapsed && expandedContentReady;
  const expandedRevealClass = showExpandedContent
    ? "opacity-100 translate-x-0"
    : "pointer-events-none opacity-0 translate-x-1";

  return (
    <aside className={`app-sidebar-panel hidden shrink-0 transition-[width] duration-200 ease-out lg:flex lg:flex-col ${collapsed ? "w-[5.5rem]" : "w-72 xl:w-76"}`}>
      <div className={`flex h-full flex-col gap-4 ${collapsed ? "px-3 pb-3 pt-4 xl:px-3 xl:pb-3 xl:pt-5" : "p-4 xl:p-5"}`}>
        {collapsed ? (
          <div className="flex min-h-[2.5rem] items-center justify-center pb-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-sm font-semibold tracking-[0.12em] text-white/95 transition hover:border-white/16 hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98]"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <Image
                src="/brand/one-technology-mark.png"
                alt="One Technology"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </button>
          </div>
        ) : showExpandedContent ? (
          <div
            className={`flex min-h-[2.5rem] items-center justify-between gap-3 px-1 py-1 transition-[opacity,transform] duration-150 ease-out ${expandedRevealClass}`}
          >
            <div className="relative h-8 w-[11.5rem]">
              <Image
                src="/brand/one-technology-logo.png"
                alt="One Technology"
                fill
                sizes="184px"
                className="object-contain object-left"
                priority
              />
            </div>

            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/52 transition hover:bg-white/6 hover:text-white/82"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <span className="text-sm">{"<"}</span>
            </button>
          </div>
        ) : (
          <div className="min-h-[2.5rem]" aria-hidden="true" />
        )}

        <nav className={`flex flex-1 overflow-y-auto ${collapsed ? "flex-col items-center gap-2 pr-0" : "flex-col gap-2.5 pr-1"}`}>
          {collapsed ? (
            <div className="flex w-full flex-col items-center gap-2">
              {collapsedRailItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 w-11 items-center justify-center rounded-[1rem] border text-white/76 transition ${
                    item.active
                      ? "border-white/16 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,248,236,0.05)]"
                      : "border-transparent bg-transparent hover:border-white/8 hover:bg-white/6 hover:text-white/94"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <NavIcon kind={item.icon} />
                </Link>
              ))}
            </div>
          ) : !showExpandedContent ? (
            <div className="min-h-0 flex-1" aria-hidden="true" />
          ) : mode === "easy" ? (
            <div className={`flex flex-col gap-4 transition-[opacity,transform] duration-150 ease-out ${expandedRevealClass}`}>
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
            </div>
          ) : (
            <div className={`flex flex-col gap-2.5 transition-[opacity,transform] duration-150 ease-out ${expandedRevealClass}`}>
              <div>
                <div className="app-sidebar-group-label mb-2 px-2">Overview</div>
                <Link href="/admin" className={navItemClass(pathname === "/admin")}>
                  Dashboard
                </Link>
              </div>

              <div className="app-sidebar-group-label px-2">Business areas</div>

              {visibleAdvancedGroups.map((group) => {
                const isActiveGroup = activeAdvancedGroups.includes(group.label);
                const collapsedGroup = collapsedGroups[group.label] ?? !isActiveGroup;

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
                        aria-expanded={!collapsedGroup}
                        aria-label={`${collapsedGroup ? "Expand" : "Collapse"} ${group.label}`}
                      >
                        {collapsedGroup ? "+" : "-"}
                      </button>
                    </div>

                    {!collapsedGroup && (
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
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
