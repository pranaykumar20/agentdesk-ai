import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { syncKnowledgeToAgents } from "@/modules/agents/data";

const bodySchema = z.object({
  /** null / omitted = sync all agents (shared knowledge changed) */
  agentId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "create", "knowledge") && !can(ctx.role, "update", "agents")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await syncKnowledgeToAgents(
      ctx.organization.id,
      parsed.data.agentId ?? null,
    );
    if (result.synced === 0 && result.errors.length > 0) {
      return NextResponse.json(
        { error: result.errors.join("; "), ...result },
        { status: 400 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Knowledge sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
