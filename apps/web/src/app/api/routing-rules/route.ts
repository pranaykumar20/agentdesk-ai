import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { createRoutingRule, listRoutingRules, reorderRoutingRules } from "@/modules/routing/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  const rules = await listRoutingRules(ctx.organization.id);
  return NextResponse.json({ rules });
}

const createSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().max(300).default(""),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "create", "routing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rule = await createRoutingRule({
    organizationId: ctx.organization.id,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  return NextResponse.json({ rule });
}

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "update", "routing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rules = await reorderRoutingRules(ctx.organization.id, parsed.data.orderedIds);
  return NextResponse.json({ rules });
}
