import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { generateEmployeePrompt } from "@/modules/agents/generate-prompt";

const capabilitySchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

const bodySchema = z.object({
  agentName: z.string().trim().min(1).max(120),
  roleTitle: z.string().trim().min(1).max(80),
  industry: z.string().trim().max(40).optional(),
  tone: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  brief: z.string().trim().max(6000).optional(),
  capabilities: z.array(capabilitySchema).max(20).optional(),
});

export async function POST(request: Request) {
  const ctx = await requirePermission("create", "agents");
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generate-prompt payload" }, { status: 400 });
  }

  try {
    const result = await generateEmployeePrompt({
      ...parsed.data,
      businessName: ctx.organization.name,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate prompt";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
