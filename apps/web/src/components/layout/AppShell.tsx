"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV, isNavActive } from "@/lib/navigation/dashboard";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { OrgOption } from "./OrganizationSwitcher";

export function AppShell({
  children,
  organizations,
  activeOrgId,
  activeRole,
  orgName,
  planName,
  minutesUsed,
  minutesIncluded,
  featureFlags,
}: {
  children: React.ReactNode;
  organizations: OrgOption[];
  activeOrgId: string;
  activeRole: string;
  orgName: string;
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
  featureFlags: Record<FeatureFlagKey, boolean>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = useMemo(() => {
    const match = DASHBOARD_NAV.find((item) => isNavActive(pathname, item.href));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-svh bg-background">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar
        organizations={organizations}
        activeOrgId={activeOrgId}
        activeRole={activeRole}
        planName={planName}
        minutesUsed={minutesUsed}
        minutesIncluded={minutesIncluded}
        featureFlags={featureFlags}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} orgName={orgName} onMenuClick={() => setMobileOpen(true)} />
        <main id="dashboard-main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
