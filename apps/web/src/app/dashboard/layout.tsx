import { redirect } from "next/navigation";
import { requireOrg, listUserOrganizations, getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { getOrgSubscription, getUsageSnapshot } from "@/modules/billing/data";
import { getOrgFeatureFlags } from "@/modules/feature-flags/data";
import { isOnboardingComplete } from "@/modules/onboarding/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const user = await getSessionUser();
  const organizations = user ? await listUserOrganizations(user.id) : [];
  const [usage, featureFlags, subscription, onboardingDone] = await Promise.all([
    getUsageSnapshot(ctx.organization.id),
    getOrgFeatureFlags(ctx.organization.id),
    getOrgSubscription(ctx.organization.id),
    isOnboardingComplete(ctx.organization.id),
  ]);

  if (!onboardingDone && (ctx.role === "OWNER" || ctx.role === "ADMIN")) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      organizations={organizations.map((o) => ({ id: o.id, name: o.name, role: o.role }))}
      activeOrgId={ctx.organization.id}
      activeRole={ctx.role}
      orgName={ctx.organization.name}
      planName={usage.planName}
      planKey={subscription.planKey}
      minutesUsed={usage.minutesUsed}
      minutesIncluded={usage.minutesIncluded}
      featureFlags={featureFlags}
    >
      {children}
    </AppShell>
  );
}
