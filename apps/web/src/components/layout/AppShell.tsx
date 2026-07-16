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
        <div className="flex-1 px-4 py-6 md:px-6">{children}</div>
      </div>
    </div>
  );
}
