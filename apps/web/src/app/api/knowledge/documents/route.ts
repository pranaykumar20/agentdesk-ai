import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { createKnowledgeDocument } from "@/modules/knowledge/data";

const bodySchema = z.object({
  title: z.string().trim().min(2).max(200),
  category: z.string().trim().max(80).optional(),
  mimeType: z.string().trim().max(120).optional(),
  byteSize: z.number().int().nonnegative().max(10 * 1024 * 1024).optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const doc = await createKnowledgeDocument({
    organizationId: ctx.organization.id,
    title: parsed.data.title,
    category: parsed.data.category,
    mimeType: parsed.data.mimeType,
    byteSize: parsed.data.byteSize,
  });

  return NextResponse.json({ document: doc });
}
