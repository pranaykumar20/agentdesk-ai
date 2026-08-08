import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { getOrgSubscription } from "@/modules/billing/data";
import { planHasFeature } from "@/modules/billing/feature-access";
import { assertCanProvisionPhoneNumber } from "@/modules/billing/plan-limits";
import { listPhoneNumbers, provisionPhoneNumber } from "@/modules/phone-numbers/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requirePermission("read", "phone_numbers");
  const numbers = await listPhoneNumbers(ctx.organization.id);
  return NextResponse.json({ numbers });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("create", "phone_numbers");
  const sub = await getOrgSubscription(ctx.organization.id);
  if (!planHasFeature(sub.planKey, "phone_numbers")) {
    return NextResponse.json({ error: "Phone numbers not available on your plan" }, { status: 403 });
  }

  let areaCode: string | undefined;
  let agentId: string | undefined;
  try {
    const body = (await request.json()) as { areaCode?: string; agentId?: string };
    areaCode = body.areaCode;
    agentId = body.agentId;
  } catch {
    // empty body ok
  }

  try {
    const existing = await listPhoneNumbers(ctx.organization.id);
    assertCanProvisionPhoneNumber(sub.planKey, existing.length);
    const number = await provisionPhoneNumber(ctx.organization.id, { areaCode, agentId });
    return NextResponse.json({ number });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to provision number";
    const status = message.includes("Plan limit") || message.includes("Publish") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
