"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, X } from "lucide-react";
import { DASHBOARD_NAV, isNavActive } from "@/lib/navigation/dashboard";
import { PlanUsageCard } from "./PlanUsageCard";
import { OrganizationSwitcher, type OrgOption } from "./OrganizationSwitcher";
import { cn } from "@/lib/utils";

export function Sidebar({
  organizations,
  activeOrgId,
  activeRole,
  planName,
  minutesUsed,
  minutesIncluded,
  mobileOpen,
  onMobileClose,
}: {
  organizations: OrgOption[];
  activeOrgId: string;
  activeRole: string;
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold" onClick={onMobileClose}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AudioLines className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm text-sidebar-foreground">
              AgentDesk <span className="text-primary">AI</span>
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label="Close sidebar"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {DASHBOARD_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-sidebar-border p-3">
          <PlanUsageCard
            planName={planName}
            minutesUsed={minutesUsed}
            minutesIncluded={minutesIncluded}
          />
          <OrganizationSwitcher
            organizations={organizations}
            activeOrgId={activeOrgId}
            activeRole={activeRole}
          />
        </div>
      </aside>
    </>
  );
}
