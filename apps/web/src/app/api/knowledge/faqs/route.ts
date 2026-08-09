import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { syncKnowledgeToAgents } from "@/modules/agents/data";
import { createFaq } from "@/modules/knowledge/data";

const bodySchema = z.object({
  question: z.string().trim().min(2).max(500),
  answer: z.string().trim().min(1).max(4000),
  category: z.string().trim().max(80).optional(),
  /** null / omitted = all agents */
  agentId: z.string().uuid().nullable().optional(),
  /** When false, caller will sync once after a batch (e.g. AI generate). Default true. */
  syncAgents: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "create", "knowledge")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const faq = await createFaq({
      organizationId: ctx.organization.id,
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category,
      agentId: parsed.data.agentId ?? null,
    });

    let sync: { synced: number; errors: string[] } | undefined;
    if (parsed.data.syncAgents) {
      sync = await syncKnowledgeToAgents(
        ctx.organization.id,
        parsed.data.agentId ?? null,
      );
    }

    return NextResponse.json({ faq, sync });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create FAQ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
