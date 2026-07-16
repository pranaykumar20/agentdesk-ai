import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";
import { buildInboundTwiml } from "@/lib/twilio";

export async function POST(request: Request) {
  const formData = await request.formData();
  const to = String(formData.get("To") ?? "");
  const from = String(formData.get("From") ?? "");
  const callSid = String(formData.get("CallSid") ?? "");

  const phone = await prisma.phoneNumber.findFirst({
    where: { e164: to },
    include: { org: true },
  });

  if (!phone) {
    const demoOrg = await prisma.organization.findFirst({
      where: { slug: "demo-restaurant" },
    });

    if (!demoOrg) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, this number is not configured.</Say></Response>`,
        { headers: { "Content-Type": "text/xml" } },
      );
    }

    const twiml = buildInboundTwiml(demoOrg.id);
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const twiml = buildInboundTwiml(phone.orgId);
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "twilio/voice" });
}
