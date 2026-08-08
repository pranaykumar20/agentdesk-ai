import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { CreateOrgForm } from "@/components/onboarding/CreateOrgForm";
import { GoLiveWizard } from "@/components/onboarding/GoLiveWizard";
import { getCurrentOrgContext, requireUser } from "@/lib/auth";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getOnboardingProgress, isOnboardingComplete } from "@/modules/onboarding/data";

export const metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireUser();
  const ctx = await getCurrentOrgContext();

  if (!ctx) {
    return (
      <AuthCard
        title="Create your organization"
        description="Start your free trial — then launch an AI receptionist in a few steps."
      >
        <CreateOrgForm />
      </AuthCard>
    );
  }

  const done = await isOnboardingComplete(ctx.organization.id);
  if (done) {
    redirect(AUTH_ROUTES.dashboard);
  }

  const progress = await getOnboardingProgress(ctx.organization.id);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <GoLiveWizard
          initialProgress={progress}
          organizationName={ctx.organization.name}
        />
      </div>
    </div>
  );
}
