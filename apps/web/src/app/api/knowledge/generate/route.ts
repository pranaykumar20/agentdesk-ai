import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  generateKnowledgeDrafts,
  generateSingleFaqDraft,
} from "@/modules/knowledge/generate";

const bodySchema = z.object({
  mode: z.enum(["batch", "faq"]).default("batch"),
  requirements: z.string().trim().min(8).max(6000),
  question: z.string().trim().max(500).optional(),
  faqCount: z.number().int().min(1).max(8).optional(),
  includeArticle: z.boolean().optional(),
  agentName: z.string().trim().max(120).optional(),
  /** BCP-47, e.g. en-US or te-IN */
  language: z.string().trim().min(2).max(16).optional(),
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
    if (parsed.data.mode === "faq") {
      const faq = await generateSingleFaqDraft({
        brief: parsed.data.requirements,
        question: parsed.data.question,
        businessName: ctx.organization.name,
        language: parsed.data.language,
      });
      return NextResponse.json({ faq });
    }

    const result = await generateKnowledgeDrafts({
      requirements: parsed.data.requirements,
      businessName: ctx.organization.name,
      industry: ctx.organization.industry ?? undefined,
      agentName: parsed.data.agentName,
      language: parsed.data.language,
      faqCount: parsed.data.faqCount,
      includeArticle: parsed.data.includeArticle,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
