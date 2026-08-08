import { redirect } from "next/navigation";
import type { OrgContext } from "@/lib/auth/org";
import { getOrgSubscription } from "@/modules/billing/data";
import { planHasFeature, type PlanFeature } from "@/modules/billing/feature-access";

/** Redirect Starter (etc.) away from Pro/Business-only dashboard pages. */
export async function requirePlanFeature(
  ctx: OrgContext,
  feature: PlanFeature,
  fallbackHref = "/dashboard/billing",
): Promise<void> {
  const sub = await getOrgSubscription(ctx.organization.id);
  if (!planHasFeature(sub.planKey, feature)) {
    redirect(fallbackHref);
  }
}
