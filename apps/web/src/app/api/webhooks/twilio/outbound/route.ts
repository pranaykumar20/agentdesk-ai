import { NextRequest, NextResponse } from "next/server";
import { buildOutboundTwiml } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId") ?? "";
  const leadId = request.nextUrl.searchParams.get("leadId") ?? "";

  if (!orgId || !leadId) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Configuration error.</Say></Response>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  }

  const twiml = buildOutboundTwiml(orgId, leadId);
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
