import { prisma } from "@ai-voice-leads/db";
import {
  buildLeadWelcomeMessage,
  isWhatsAppConfigured,
  sendWhatsAppMessage,
} from "@ai-voice-leads/whatsapp";

export interface SequenceStepDef {
  channel: "WHATSAPP" | "SMS" | "EMAIL" | "VOICE";
  delaySec: number;
  template: string;
}

export const DEFAULT_FORM_SEQUENCE: SequenceStepDef[] = [
  { channel: "SMS", delaySec: 0, template: "lead_welcome" },
  { channel: "VOICE", delaySec: 5, template: "outbound_call" },
];

export const RETRY_SEQUENCE: SequenceStepDef[] = [
  { channel: "VOICE", delaySec: 900, template: "retry_call_1" },
  { channel: "VOICE", delaySec: 1800, template: "retry_call_2" },
  { channel: "SMS", delaySec: 2700, template: "retry_sms" },
];

export async function ensureDefaultSequence(orgId: string) {
  const existing = await prisma.sequence.findFirst({
    where: { orgId, trigger: "FORM_SUBMIT" },
  });

  if (existing) return existing;

  return prisma.sequence.create({
    data: {
      orgId,
      name: "Default form follow-up",
      trigger: "FORM_SUBMIT",
      steps: DEFAULT_FORM_SEQUENCE as object,
      isActive: true,
    },
  });
}

export async function startSequenceForLead(params: {
  orgId: string;
  leadId: string;
  trigger?: "FORM_SUBMIT" | "CALL_FAILED" | "CALL_NO_ANSWER";
}) {
  const trigger = params.trigger ?? "FORM_SUBMIT";

  const sequence = await prisma.sequence.findFirst({
    where: { orgId: params.orgId, trigger, isActive: true },
  });

  if (!sequence) {
    await ensureDefaultSequence(params.orgId);
    return startSequenceForLead(params);
  }

  const steps = sequence.steps as unknown as SequenceStepDef[];

  const run = await prisma.sequenceRun.create({
    data: {
      sequenceId: sequence.id,
      leadId: params.leadId,
      status: "running",
      steps: {
        create: steps.map((step) => ({
          channel: step.channel,
          delaySec: step.delaySec,
          template: step.template,
          status: "PENDING",
          runAt: new Date(Date.now() + step.delaySec * 1000),
        })),
      },
    },
    include: { steps: true },
  });

  for (const step of run.steps) {
    if (step.delaySec === 0) {
      await executeSequenceStep(step.id);
    }
  }

  return run;
}

export async function executeSequenceStep(stepId: string) {
  const step = await prisma.sequenceStep.findUnique({
    where: { id: stepId },
    include: {
      sequenceRun: {
        include: {
          lead: true,
          sequence: { include: { org: { include: { profile: true } } } },
        },
      },
    },
  });

  if (!step || step.status !== "PENDING") return;

  await prisma.sequenceStep.update({
    where: { id: stepId },
    data: { status: "RUNNING" },
  });

  const lead = step.sequenceRun.lead;
  const org = step.sequenceRun.sequence.org;
  const orgName = org.name;

  try {
    if (step.channel === "WHATSAPP") {
      const message = buildLeadWelcomeMessage(orgName, lead.name);
      const result = await sendWhatsAppMessage({ to: lead.phone, message });

      await prisma.message.create({
        data: {
          orgId: org.id,
          leadId: lead.id,
          channel: "WHATSAPP",
          direction: "OUTBOUND",
          content: message,
          status: result.ok ? "SENT" : "FAILED",
          externalId: result.messageId,
          error: result.error,
        },
      });

      if (!result.ok && !isWhatsAppConfigured()) {
        await prisma.sequenceStep.update({
          where: { id: stepId },
          data: { status: "SKIPPED", error: "WhatsApp not configured" },
        });
        return;
      }

      if (!result.ok) throw new Error(result.error);
    } else if (step.channel === "VOICE") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const secret = process.env.INTERNAL_API_SECRET ?? "change-me-in-production";

      await fetch(`${baseUrl}/api/internal/trigger-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ leadId: lead.id, orgId: org.id }),
      });
    } else if (step.channel === "SMS") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
      const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
      const from = process.env.TWILIO_PHONE_NUMBER?.trim();

      if (accountSid && authToken && from) {
        const smsBody =
          step.template === "lead_welcome"
            ? `Hi ${lead.name}! Thanks for reaching out to ${orgName}. We're calling you shortly to help with your enquiry. Reply STOP to opt out.`
            : `Hi ${lead.name}, we tried reaching you from ${orgName}. Reply or call us back!`;

        const body = new URLSearchParams({
          To: lead.phone,
          From: from,
          Body: smsBody,
        });

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        await prisma.message.create({
          data: {
            orgId: org.id,
            leadId: lead.id,
            channel: "SMS",
            direction: "OUTBOUND",
            content: smsBody,
            status: "SENT",
          },
        });
      } else if (step.template === "lead_welcome") {
        await prisma.sequenceStep.update({
          where: { id: stepId },
          data: { status: "SKIPPED", error: "Twilio SMS not configured" },
        });
        return;
      }
    }

    await prisma.sequenceStep.update({
      where: { id: stepId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } catch (err) {
    await prisma.sequenceStep.update({
      where: { id: stepId },
      data: {
        status: "FAILED",
        error: err instanceof Error ? err.message : "Unknown error",
      },
    });
  }
}

export async function processPendingSequenceSteps() {
  const now = new Date();
  const pending = await prisma.sequenceStep.findMany({
    where: { status: "PENDING", runAt: { lte: now } },
    take: 50,
  });

  for (const step of pending) {
    await executeSequenceStep(step.id);
  }

  return pending.length;
}
