"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV, isNavActive } from "@/lib/navigation/dashboard";
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
}: {
  children: React.ReactNode;
  organizations: OrgOption[];
  activeOrgId: string;
  activeRole: string;
  orgName: string;
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = useMemo(() => {
    const match = DASHBOARD_NAV.find((item) => isNavActive(pathname, item.href));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
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
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} orgName={orgName} onMenuClick={() => setMobileOpen(true)} />
        <main id="dashboard-main" className="flex-1 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
