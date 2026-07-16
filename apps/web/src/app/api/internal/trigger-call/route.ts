import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";
import { verifyInternalAuth } from "@/lib/auth";
import { initiateOutboundCall } from "@/lib/twilio";

export async function POST(request: Request) {
  if (!verifyInternalAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { leadId?: string; orgId?: string };
  const leadId = body.leadId?.trim();
  const orgId = body.orgId?.trim();

  if (!leadId || !orgId) {
    return NextResponse.json({ error: "leadId and orgId required" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, orgId, dnc: false },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const fromNumber =
    (await prisma.phoneNumber.findFirst({
      where: { orgId, isPrimary: true },
    })) ??
    (process.env.TWILIO_PHONE_NUMBER ? { e164: process.env.TWILIO_PHONE_NUMBER } : null);

  if (!fromNumber?.e164) {
    return NextResponse.json({ error: "No phone number configured" }, { status: 503 });
  }

  try {
    const call = await initiateOutboundCall({
      orgId,
      leadId,
      to: lead.phone,
      from: fromNumber.e164,
    });

    await prisma.callSession.create({
      data: {
        orgId,
        leadId,
        direction: "OUTBOUND",
        status: "RINGING",
        twilioCallSid: call.sid,
        fromNumber: fromNumber.e164,
        toNumber: lead.phone,
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CALLING" },
    });

    return NextResponse.json({ ok: true, callSid: call.sid });
  } catch (err) {
    console.error("[trigger-call]", err);
    return NextResponse.json({ error: "Call failed" }, { status: 500 });
  }
}
