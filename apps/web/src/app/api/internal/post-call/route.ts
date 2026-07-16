import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";
import { notifyOwner } from "@ai-voice-leads/notifications";
import { dispatchIntegrations } from "@ai-voice-leads/integrations";
import { startSequenceForLead } from "@ai-voice-leads/sequences";
import { extractCallData } from "@/lib/extraction";
import { verifyInternalAuth } from "@/lib/auth";
import { initiateOutboundCall } from "@/lib/twilio";

export async function POST(request: Request) {
  if (!verifyInternalAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { callSessionId?: string };
  const callSessionId = body.callSessionId?.trim();

  if (!callSessionId) {
    return NextResponse.json({ error: "callSessionId required" }, { status: 400 });
  }

  const session = await prisma.callSession.findUnique({
    where: { id: callSessionId },
    include: {
      org: { include: { profile: true, playbooks: { where: { isActive: true }, take: 1 } } },
      lead: true,
      summary: true,
    },
  });

  if (!session || session.summary) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const transcript = session.transcript ?? "";
  const fieldsToCollect =
    (session.org.playbooks[0]?.fieldsToCollect as string[]) ?? [];

  let extracted;
  try {
    extracted = await extractCallData(transcript, fieldsToCollect);
  } catch (err) {
    extracted = {
      intent: "unknown",
      summary: transcript.slice(0, 500) || "Call completed with no transcript.",
    };
    console.error("[post-call] extraction failed:", err);
  }

  await prisma.callSummary.create({
    data: {
      callSessionId: session.id,
      intent: extracted.intent,
      customerName: extracted.customer_name,
      customerPhone: extracted.customer_phone,
      summary: extracted.summary,
      structured: extracted as object,
      urgency: extracted.urgency,
    },
  });

  await prisma.callSession.update({
    where: { id: session.id },
    data: { extractedData: extracted as object },
  });

  if (extracted.dnc_requested && session.leadId) {
    await prisma.lead.update({
      where: { id: session.leadId },
      data: { dnc: true, status: "DNC" },
    });
  } else if (session.leadId) {
    await prisma.lead.update({
      where: { id: session.leadId },
      data: { status: "COMPLETED" },
    });
  }

  if (
    session.leadId &&
    (session.status === "NO_ANSWER" || session.status === "BUSY" || session.status === "FAILED")
  ) {
    await startSequenceForLead({
      orgId: session.orgId,
      leadId: session.leadId,
      trigger: "CALL_NO_ANSWER",
    });
  }

  await notifyOwner({
    orgName: session.org.name,
    direction: session.direction,
    customerName: extracted.customer_name ?? session.lead?.name,
    customerPhone:
      extracted.customer_phone ?? session.lead?.phone ?? session.fromNumber ?? undefined,
    summary: extracted.summary,
    structured: extracted,
    transcript,
    callId: session.id,
    notifyEmail: session.org.profile?.notifyEmail ?? undefined,
    notifyPhone: session.org.profile?.notifyPhone ?? undefined,
  });

  await dispatchIntegrations({
    event: "call.completed",
    orgId: session.orgId,
    leadId: session.leadId ?? undefined,
    callSessionId: session.id,
    data: {
      summary: extracted.summary,
      structured: extracted,
      direction: session.direction,
      status: session.status,
    },
  });

  return NextResponse.json({ ok: true, callSessionId: session.id });
}
