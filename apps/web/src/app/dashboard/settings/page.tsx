import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { getSavedGeneralSettings } from "@/modules/settings/data";
import { getUsageSnapshot } from "@/modules/billing/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { organization } = await requireOrg();
  const settings = getSavedGeneralSettings(organization.id, organization);
  const usage = await getUsageSnapshot(organization.id);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account, preferences, and system configurations."
      />
      <SettingsPanel
        initial={settings}
        planName={usage.planName}
        minutesUsed={usage.minutesUsed}
        minutesIncluded={usage.minutesIncluded}
      />
    </div>
  );
}
