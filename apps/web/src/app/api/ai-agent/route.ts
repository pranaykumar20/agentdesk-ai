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

const SYSTEM_PROMPT_MAX = 20_000;

const patchSchema = z.object({
  action: z.enum(["save_draft", "publish"]).default("save_draft"),
  id: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(2).optional(),
  roleTitle: z.string().trim().min(2).optional(),
  description: z.string().trim().max(500).optional(),
  greeting: z.string().trim().max(500).optional(),
  systemPrompt: z
    .string()
    .trim()
    .max(
      SYSTEM_PROMPT_MAX,
      `System prompt must be at most ${SYSTEM_PROMPT_MAX.toLocaleString()} characters`,
    )
    .optional(),
  tone: z.string().trim().max(80).optional(),
  voice: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  capabilities: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(80),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(300),
        enabled: z.boolean(),
      }),
    )
    .max(20)
    .optional(),
});

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "update", "agents")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      return NextResponse.json({ error: detail || "Invalid input" }, { status: 400 });
    }

    // Persist editor fields first so language/voice (and prompt) sync to Vapi
    // before a publish, not only on "Save draft".
    const agent = await updateAgentDraft(ctx.organization.id, parsed.data);

    if (parsed.data.action === "publish") {
      if (!can(ctx.role, "publish", "agents")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const published = await publishAgent(ctx.organization.id, agent.id);
      return NextResponse.json({ agent: published });
    }

    return NextResponse.json({ agent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update agent";
    console.error("[ai-agent PATCH]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
