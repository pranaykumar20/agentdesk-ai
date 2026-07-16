import { NextResponse } from "next/server";
import { getTelephonyProvider } from "@/lib/providers";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

/**
 * Twilio inbound voice webhook.
 * Phase G: Retell owns AI conversations; this endpoint acknowledges PSTN webhooks
 * and optionally forwards when `forwardTo` is set. Signature verified via TelephonyProvider.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const telephony = getTelephonyProvider();
  const headers = new Headers(request.headers);
  // Help Twilio signature validation reconstruct URL
  const url = new URL(request.url);
  headers.set("x-twilio-request-url", `${process.env.TWILIO_WEBHOOK_BASE_URL?.replace(/\/$/, "") || url.origin}${url.pathname}${url.search}`);

  const valid = await telephony.verifyWebhook(headers, rawBody);
  if (telephony.name === "twilio" && !valid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const callSid = params.get("CallSid") ?? "unknown";
  const forwardTo = url.searchParams.get("forwardTo");

  const claim = await claimWebhookEvent({
    provider: "twilio",
    idempotencyKey: `voice:${callSid}`,
    eventType: "voice_inbound",
    payload: Object.fromEntries(params.entries()),
  });

  if (claim.claimed) {
    await completeWebhookEvent(claim.eventId, { status: "processed" });
  }

  const twiml = forwardTo
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Dial>${escapeXml(forwardTo)}</Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Thanks for calling. Our AI receptionist is being connected through Retell. Please hang up and try again later if you hear this message.</Say></Response>`;

  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "twilio/voice" });
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
