import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { createAiEmployee, listAiEmployees } from "@/modules/agents/data";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  roleTitle: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  department: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  voice: z.string().trim().max(80).optional(),
});

export async function GET() {
  const ctx = await requirePermission("read", "agents");
  const items = await listAiEmployees(ctx.organization.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("create", "agents");
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee payload" }, { status: 400 });
  }
  const agent = await createAiEmployee(ctx.organization.id, parsed.data);
  return NextResponse.json({ id: agent.id, employee: agent });
}
