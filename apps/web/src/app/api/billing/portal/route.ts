import { NextResponse } from "next/server";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getBillingProvider } from "@/lib/providers";
import { getOrgSubscription } from "@/modules/billing/data";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "manage", "billing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sub = await getOrgSubscription(ctx.organization.id);
  const customerId = sub.stripeCustomerId ?? `cus_pending_${ctx.organization.id.slice(0, 8)}`;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const billing = getBillingProvider();

  try {
    const session = await billing.createCustomerPortalSession({
      customerId,
      returnUrl: `${origin}/dashboard/billing`,
    });
    return NextResponse.json({ ...session, provider: billing.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
