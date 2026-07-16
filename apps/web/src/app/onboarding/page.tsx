import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { CreateOrgForm } from "@/components/onboarding/CreateOrgForm";
import { getCurrentOrgContext, requireUser } from "@/lib/auth";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export const metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireUser();
  const ctx = await getCurrentOrgContext();
  if (ctx) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <AuthCard
      title="Create your organization"
      description="Phase A foundation — full multi-step onboarding lands in a later phase."
    >
      <CreateOrgForm />
    </AuthCard>
  );
}
