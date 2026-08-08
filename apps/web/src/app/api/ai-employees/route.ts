import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { countAiEmployees, createAiEmployee, listAiEmployees } from "@/modules/agents/data";
import { getOrgSubscription } from "@/modules/billing/data";
import { assertCanCreateAiEmployee } from "@/modules/billing/plan-limits";
import { planHasFeature } from "@/modules/billing/feature-access";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  roleTitle: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  department: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  voice: z.string().trim().max(80).optional(),
  greeting: z.string().trim().max(500).optional(),
  systemPrompt: z.string().trim().max(8000).optional(),
});

export async function GET() {
  const ctx = await requirePermission("read", "agents");
  const items = await listAiEmployees(ctx.organization.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("create", "agents");
  const sub = await getOrgSubscription(ctx.organization.id);
  if (!planHasFeature(sub.planKey, "ai_employees")) {
    return NextResponse.json({ error: "AI Employees not available on your plan" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee payload" }, { status: 400 });
  }

  try {
    const count = await countAiEmployees(ctx.organization.id);
    assertCanCreateAiEmployee(sub.planKey, count);
    const agent = await createAiEmployee(ctx.organization.id, parsed.data);
    return NextResponse.json({ id: agent.id, employee: agent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create AI employee";
    const status = message.includes("Plan limit") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
