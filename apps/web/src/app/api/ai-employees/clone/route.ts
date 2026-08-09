import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { cloneAiEmployee, countAiEmployees } from "@/modules/agents/data";
import { getOrgSubscription } from "@/modules/billing/data";
import { assertCanCreateAiEmployee } from "@/modules/billing/plan-limits";
import { planHasFeature } from "@/modules/billing/feature-access";

const bodySchema = z.object({
  id: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  const ctx = await requirePermission("create", "agents");
  const sub = await getOrgSubscription(ctx.organization.id);
  if (!planHasFeature(sub.planKey, "ai_employees")) {
    return NextResponse.json({ error: "AI Employees not available on your plan" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid clone payload" }, { status: 400 });
  }

  try {
    const count = await countAiEmployees(ctx.organization.id);
    assertCanCreateAiEmployee(sub.planKey, count);
    const agent = await cloneAiEmployee(ctx.organization.id, parsed.data.id);
    if (!agent) {
      return NextResponse.json({ error: "Source AI employee not found" }, { status: 404 });
    }
    return NextResponse.json({ id: agent.id, employee: agent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clone AI employee";
    const status = message.includes("Plan limit") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
