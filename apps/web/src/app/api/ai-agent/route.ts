import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getAiAgent, publishAgent, updateAgentDraft } from "@/modules/agents/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  const agent = await getAiAgent(ctx.organization.id);
  return NextResponse.json({ agent });
}

const patchSchema = z.object({
  action: z.enum(["save_draft", "publish"]).default("save_draft"),
  name: z.string().trim().min(2).optional(),
  roleTitle: z.string().trim().min(2).optional(),
  description: z.string().trim().max(500).optional(),
  greeting: z.string().trim().max(500).optional(),
  systemPrompt: z.string().trim().max(5000).optional(),
  tone: z.string().trim().max(80).optional(),
  voice: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
});

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "update", "agents")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (parsed.data.action === "publish") {
    if (!can(ctx.role, "publish", "agents")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const agent = await publishAgent(ctx.organization.id);
    return NextResponse.json({ agent });
  }

  const agent = await updateAgentDraft(ctx.organization.id, parsed.data);
  return NextResponse.json({ agent });
}
