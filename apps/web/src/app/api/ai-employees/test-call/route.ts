import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { initiateEmployeeTestCall } from "@/modules/agents/data";

const bodySchema = z.object({
  agentId: z.string().trim().min(1).max(80),
  toNumber: z.string().trim().min(7).max(32),
  fromNumber: z.string().trim().max(32).optional(),
});

export async function POST(request: Request) {
  const ctx = await requirePermission("update", "agents");
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid test-call payload" }, { status: 400 });
  }

  try {
    const result = await initiateEmployeeTestCall({
      organizationId: ctx.organization.id,
      agentId: parsed.data.agentId,
      toNumber: parsed.data.toNumber,
      fromNumber: parsed.data.fromNumber,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Test call failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
