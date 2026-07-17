import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { cancelProposedAction, confirmProposedAction } from "@/lib/chat/actions";
import { writeAvaAuditEvent } from "@/lib/chat/audit";

export const runtime = "nodejs";

const bodySchema = z.object({
  actionId: z.string().min(8).max(80),
  decision: z.enum(["confirm", "cancel"]),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action payload." }, { status: 400 });
  }

  const result =
    parsed.data.decision === "confirm"
      ? await confirmProposedAction(ctx, user.id, parsed.data.actionId)
      : cancelProposedAction(ctx, user.id, parsed.data.actionId);

  await writeAvaAuditEvent({
    organizationId: ctx.organization.id,
    userId: user.id,
    model: "action-confirm",
    toolsUsed: [`action:${parsed.data.decision}`],
    citations: [],
    userMessage: `${parsed.data.decision}:${parsed.data.actionId}`,
    assistantReply: result.ok ? result.message : result.error,
    usedFallback: false,
    guardReasons: [],
  });

  if (!result.ok) {
    const status = result.error.startsWith("Forbidden") ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, message: result.message, result: result.result });
}
