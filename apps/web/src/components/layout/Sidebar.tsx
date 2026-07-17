"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, X } from "lucide-react";
import { filterNavForRole, groupNavItems, isNavActive } from "@/lib/navigation/dashboard";
import type { FeatureFlagKey } from "@/lib/feature-flags";
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
  featureFlags,
  mobileOpen,
  onMobileClose,
}: {
  organizations: OrgOption[];
  activeOrgId: string;
  activeRole: string;
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
  featureFlags: Record<FeatureFlagKey, boolean>;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const sections = groupNavItems(filterNavForRole(activeRole, featureFlags));

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation overlay"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-30 lg:h-svh lg:w-64 lg:shrink-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3 md:h-16 md:px-4">
          <Link
            href="/dashboard"
            className="inline-flex min-w-0 items-center gap-2 font-bold"
            onClick={onMobileClose}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AudioLines className="h-4 w-4" aria-hidden />
            </span>
            <span className="truncate text-sm text-sidebar-foreground">
              AgentDesk <span className="text-primary">AI</span>
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label="Close sidebar"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-2 py-3 md:px-3 md:py-4"
          aria-label="Dashboard"
        >
          {sections.map((section) => (
            <div key={section.group}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-sidebar-border bg-sidebar p-2 md:space-y-3 md:p-3">
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
