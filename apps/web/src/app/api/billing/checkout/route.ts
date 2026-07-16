import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getBillingProvider } from "@/lib/providers";
import { startCheckout } from "@/modules/billing/data";

const bodySchema = z.object({
  planKey: z.enum(["starter", "professional", "business"]).default("professional"),
  interval: z.enum(["month", "year"]).default("month"),
  priceId: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "manage", "billing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { priceId, planKey, interval } = await startCheckout({
    organizationId: ctx.organization.id,
    planKey: parsed.data.planKey,
    interval: parsed.data.interval,
  });

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const billing = getBillingProvider();

  try {
    const session = await billing.createCheckoutSession({
      organizationId: ctx.organization.id,
      priceId: parsed.data.priceId ?? priceId,
      successUrl: `${origin}/dashboard/billing?billing=success&plan=${planKey}`,
      cancelUrl: `${origin}/dashboard/billing?billing=cancel`,
      customerEmail: user.email,
    });
    return NextResponse.json({ ...session, planKey, interval, provider: billing.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
