import { prisma } from "@ai-voice-leads/db";
import {
  buildSystemPrompt,
  type CallContext,
  type MenuItem,
  type BusinessHours,
} from "@ai-voice-leads/shared";

export async function loadCallContext(params: {
  orgId: string;
  direction: "INBOUND" | "OUTBOUND";
  leadId?: string;
}): Promise<{ context: CallContext; callSessionId: string }> {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: {
      profile: true,
      playbooks: { where: { isActive: true }, take: 1 },
    },
  });

  if (!org) {
    throw new Error(`Organization not found: ${params.orgId}`);
  }

  const playbook = org.playbooks[0];
  const profile = org.profile;

  let leadName: string | undefined;
  let leadMessage: string | undefined;

  if (params.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
    leadName = lead?.name;
    leadMessage = lead?.message ?? undefined;
  }

  let callSession = params.leadId
    ? await prisma.callSession.findFirst({
        where: {
          orgId: params.orgId,
          leadId: params.leadId,
          direction: params.direction,
          status: { in: ["RINGING", "IN_PROGRESS"] },
        },
        orderBy: { startedAt: "desc" },
      })
    : null;

  if (!callSession) {
    callSession = await prisma.callSession.create({
      data: {
        orgId: org.id,
        leadId: params.leadId,
        direction: params.direction,
        status: "IN_PROGRESS",
        answeredAt: new Date(),
      },
    });
  } else {
    await prisma.callSession.update({
      where: { id: callSession.id },
      data: { status: "IN_PROGRESS", answeredAt: new Date() },
    });
  }

  const context: CallContext = {
    orgId: org.id,
    orgName: org.name,
    industry: profile?.industry ?? "GENERAL",
    greeting: profile?.greeting ?? "Hello, thank you for calling.",
    hours: (profile?.hours as BusinessHours) ?? {},
    menuOrServices: (profile?.menuOrServices as unknown as MenuItem[]) ?? [],
    playbookPrompt: playbook?.systemPrompt ?? "You are a helpful phone assistant.",
    fieldsToCollect: (playbook?.fieldsToCollect as unknown as string[]) ?? [],
    direction: params.direction,
    leadName,
    leadMessage,
  };

  return { context, callSessionId: callSession.id };
}

export function getInitialGreeting(context: CallContext): string {
  if (context.direction === "OUTBOUND" && context.leadName) {
    return `Hi, this is the automated assistant calling from ${context.orgName} about your recent enquiry. Am I speaking with ${context.leadName}?`;
  }
  return context.greeting;
}

export function getDeepgramAgentSettings(systemPrompt: string) {
  return {
    type: "Settings",
    audio: {
      input: {
        encoding: "mulaw",
        sample_rate: 8000,
      },
      output: {
        encoding: "mulaw",
        sample_rate: 8000,
        container: "none",
      },
    },
    agent: {
      listen: {
        provider: {
          type: "deepgram",
          model: "nova-3",
          smart_format: true,
        },
      },
      think: {
        provider: {
          type: "open_ai",
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          temperature: 0.6,
        },
        prompt: systemPrompt,
      },
      speak: {
        provider: {
          type: "deepgram",
          model: "aura-2-thalia-en",
        },
      },
      greeting: getInitialGreetingFromPrompt(systemPrompt),
    },
  };
}

function getInitialGreetingFromPrompt(_systemPrompt: string): string {
  return "";
}

export async function saveCallTurn(callSessionId: string, role: string, content: string) {
  await prisma.callTurn.create({
    data: { callSessionId, role, content },
  });

  const session = await prisma.callSession.findUnique({
    where: { id: callSessionId },
    select: { transcript: true },
  });

  const line = `${role}: ${content}`;
  const transcript = session?.transcript ? `${session.transcript}\n${line}` : line;

  await prisma.callSession.update({
    where: { id: callSessionId },
    data: { transcript },
  });
}

export async function updateCallSession(
  callSessionId: string,
  data: {
    twilioCallSid?: string;
    fromNumber?: string;
    toNumber?: string;
    status?: "RINGING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "NO_ANSWER" | "BUSY";
  },
) {
  await prisma.callSession.update({
    where: { id: callSessionId },
    data,
  });
}

export async function finalizeCallSession(callSessionId: string) {
  const session = await prisma.callSession.findUnique({
    where: { id: callSessionId },
    include: { turns: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) return null;

  const transcript =
    session.transcript ??
    session.turns.map((t) => `${t.role}: ${t.content}`).join("\n");

  await prisma.callSession.update({
    where: { id: callSessionId },
    data: {
      status: "COMPLETED",
      endedAt: new Date(),
      transcript,
      durationSec: session.answeredAt
        ? Math.round((Date.now() - session.answeredAt.getTime()) / 1000)
        : undefined,
    },
  });

  return { ...session, transcript };
}

export { buildSystemPrompt };
