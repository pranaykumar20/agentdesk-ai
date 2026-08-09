import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { syncKnowledgeToAgents } from "@/modules/agents/data";
import { createKnowledgeDocument } from "@/modules/knowledge/data";

const bodySchema = z.object({
  title: z.string().trim().min(2).max(200),
  category: z.string().trim().max(80).optional(),
  mimeType: z.string().trim().max(120).optional(),
  byteSize: z.number().int().nonnegative().max(10 * 1024 * 1024).optional(),
  /** Optional body / summary stored as a knowledge chunk for agent prompts */
  content: z.string().trim().max(8000).optional(),
  /** null / omitted = all agents */
  agentId: z.string().uuid().nullable().optional(),
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
    const doc = await createKnowledgeDocument({
      organizationId: ctx.organization.id,
      title: parsed.data.title,
      category: parsed.data.category,
      mimeType: parsed.data.mimeType,
      byteSize: parsed.data.byteSize,
      content: parsed.data.content,
      agentId: parsed.data.agentId ?? null,
    });

    let sync: { synced: number; errors: string[] } | undefined;
    if (parsed.data.syncAgents) {
      sync = await syncKnowledgeToAgents(
        ctx.organization.id,
        parsed.data.agentId ?? null,
      );
    }

    return NextResponse.json({ document: doc, sync });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
