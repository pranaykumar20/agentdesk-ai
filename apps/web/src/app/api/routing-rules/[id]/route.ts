import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { duplicateRoutingRule, updateRoutingRuleStatus } from "@/modules/routing/data";

const patchSchema = z.object({
  status: z.enum(["active", "paused", "disabled"]).optional(),
  action: z.enum(["duplicate"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "update", "routing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (parsed.data.action === "duplicate") {
    const rule = await duplicateRoutingRule(ctx.organization.id, id);
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ rule });
  }

  if (parsed.data.status) {
    const rule = await updateRoutingRuleStatus(ctx.organization.id, id, parsed.data.status);
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ rule });
  }

  return NextResponse.json({ error: "No changes" }, { status: 400 });
}
