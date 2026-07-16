import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";
import { startSequenceForLead } from "@ai-voice-leads/sequences";
import { dispatchIntegrations } from "@ai-voice-leads/integrations";
import {
  TCPA_CONSENT_TEXT,
  US_MARKETING,
  isValidE164,
  isWithinBusinessHours,
  normalizePhone,
  type BusinessHours,
  type LeadSubmission,
} from "@ai-voice-leads/shared";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")?.trim();
  const body = (await request.json()) as LeadSubmission & { orgSlug?: string };

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "Consent is required for outbound calls", consentText: TCPA_CONSENT_TEXT },
      { status: 400 },
    );
  }

  const phone = normalizePhone(body.phone);
  if (!isValidE164(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const org = apiKey
    ? await prisma.organization.findUnique({
        where: { apiKey },
        include: { profile: true },
      })
    : body.orgSlug
      ? await prisma.organization.findUnique({
          where: { slug: body.orgSlug },
          include: { profile: true },
        })
      : null;

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  if (await prisma.lead.findFirst({ where: { orgId: org.id, phone, dnc: true } })) {
    return NextResponse.json({ error: "This number has opted out of calls" }, { status: 403 });
  }

  const lead = await prisma.lead.create({
    data: {
      orgId: org.id,
      name: body.name.trim(),
      phone,
      email: body.email?.trim(),
      message: body.message?.trim(),
      source: body.orgSlug ? "hosted_form" : "embed_form",
      consentText: body.consentText ?? TCPA_CONSENT_TEXT,
      consentedAt: new Date(),
      status: "QUEUED",
    },
  });

  await dispatchIntegrations({
    event: "lead.created",
    orgId: org.id,
    leadId: lead.id,
    data: {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
      orgName: org.name,
    },
  });

  const hours = (org.profile?.hours as BusinessHours) ?? {};
  const timezone = org.profile?.timezone ?? "America/New_York";
  const withinHours = isWithinBusinessHours(hours, timezone);

  if (!withinHours) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "SUBMITTED", metadata: { queuedReason: "outside_business_hours" } },
    });

    await startSequenceForLead({ orgId: org.id, leadId: lead.id, trigger: "FORM_SUBMIT" });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      queued: true,
      message: "Your enquiry was received. We will contact you during business hours.",
    });
  }

  try {
    await startSequenceForLead({ orgId: org.id, leadId: lead.id, trigger: "FORM_SUBMIT" });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "CALLING" },
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      message: US_MARKETING.followUpMessage,
    });
  } catch (err) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "FAILED" },
    });

    console.error("[leads] sequence start failed:", err);
    return NextResponse.json({ error: "Failed to initiate follow-up" }, { status: 500 });
  }
}
