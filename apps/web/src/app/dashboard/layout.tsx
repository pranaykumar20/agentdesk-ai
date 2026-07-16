import { requireOrg, listUserOrganizations, getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { getUsageSnapshot } from "@/modules/billing/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const user = await getSessionUser();
  const organizations = user ? await listUserOrganizations(user.id) : [];
  const usage = await getUsageSnapshot(ctx.organization.id);

  return (
    <AppShell
      organizations={organizations.map((o) => ({ id: o.id, name: o.name, role: o.role }))}
      activeOrgId={ctx.organization.id}
      activeRole={ctx.role}
      orgName={ctx.organization.name}
      planName={usage.planName}
      minutesUsed={usage.minutesUsed}
      minutesIncluded={usage.minutesIncluded}
    >
      {children}
    </AppShell>
  );
}
