import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrg } from "@/lib/auth";
import {
  completeOnboarding,
  getOnboardingProgress,
  saveBusinessKnowledge,
  saveOnboardingStep,
} from "@/modules/onboarding/data";
import { createAiEmployee, publishAgent } from "@/modules/agents/data";
import { provisionPhoneNumber } from "@/modules/phone-numbers/data";
import { getVoiceProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

const knowledgeSchema = z.object({
  step: z.literal(2),
  hours: z.string().trim().min(3).max(2000),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().max(300),
        answer: z.string().trim().max(2000),
      }),
    )
    .max(5),
});

const agentSchema = z.object({
  step: z.literal(3),
  name: z.string().trim().min(1).max(120),
  roleTitle: z.string().trim().min(1).max(80).default("Receptionist"),
  description: z.string().trim().max(500).optional(),
  /** e.g. en-US or te-IN (Telugu via Vapi Deepgram STT + Azure TTS) */
  language: z.string().trim().min(2).max(16).optional(),
  voice: z.string().trim().min(1).max(80).optional(),
});

const phoneSchema = z.object({
  step: z.literal(4),
  areaCode: z.string().trim().max(8).optional(),
  agentId: z.string().trim().min(1).max(80).optional(),
});

const testSchema = z.object({
  step: z.literal(5),
  testPhone: z.string().trim().max(32).optional(),
  skipTestCall: z.boolean().optional(),
});

export async function GET() {
  const ctx = await requireOrg();
  const progress = await getOnboardingProgress(ctx.organization.id);
  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const ctx = await requireOrg();
  const body = await request.json();
  const step = Number(body?.step);

  try {
    if (step === 2) {
      const parsed = knowledgeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid hours/FAQ payload" }, { status: 400 });
      }
      await saveBusinessKnowledge(ctx.organization.id, {
        hours: parsed.data.hours,
        faqs: parsed.data.faqs,
      });
      const progress = await saveOnboardingStep(ctx.organization.id, 2, {
        hours: parsed.data.hours,
      });
      return NextResponse.json({ progress });
    }

    if (step === 3) {
      const parsed = agentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid AI employee payload" }, { status: 400 });
      }
      const language = parsed.data.language ?? "en-US";
      // Role training template is applied inside createAiEmployee (identity, flows, guardrails).
      const agent = await createAiEmployee(ctx.organization.id, {
        name: parsed.data.name,
        roleTitle: parsed.data.roleTitle,
        description: parsed.data.description,
        language,
        voice: parsed.data.voice,
      });
      const published = await publishAgent(ctx.organization.id, agent.id);
      const progress = await saveOnboardingStep(ctx.organization.id, 3, {
        agentId: published.id,
      });
      return NextResponse.json({ progress, agentId: published.id });
    }

    if (step === 4) {
      const parsed = phoneSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid phone payload" }, { status: 400 });
      }
      const agentId =
        parsed.data.agentId ??
        (typeof (await getOnboardingProgress(ctx.organization.id)).data.agentId === "string"
          ? String((await getOnboardingProgress(ctx.organization.id)).data.agentId)
          : undefined);
      const number = await provisionPhoneNumber(ctx.organization.id, {
        areaCode: parsed.data.areaCode,
        agentId,
      });
      const progress = await saveOnboardingStep(ctx.organization.id, 4, {
        phoneNumberId: number.id,
        e164: number.e164,
      });
      return NextResponse.json({ progress, number });
    }

    if (step === 5) {
      const parsed = testSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid go-live payload" }, { status: 400 });
      }
      const progress = await getOnboardingProgress(ctx.organization.id);
      const agentId = typeof progress.data.agentId === "string" ? progress.data.agentId : null;
      const fromNumber = typeof progress.data.e164 === "string" ? progress.data.e164 : undefined;

      if (parsed.data.testPhone && agentId && !parsed.data.skipTestCall) {
        const { getAiEmployeeById } = await import("@/modules/agents/data");
        const agent = await getAiEmployeeById(ctx.organization.id, agentId);
        if (agent?.externalAgentId) {
          const voice = getVoiceProvider();
          await voice.initiateTestCall({
            externalAgentId: agent.externalAgentId,
            toNumber: parsed.data.testPhone,
            fromNumber,
          });
        }
      }

      await completeOnboarding(ctx.organization.id);
      return NextResponse.json({ done: true });
    }

    return NextResponse.json({ error: "Unknown onboarding step" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onboarding step failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
