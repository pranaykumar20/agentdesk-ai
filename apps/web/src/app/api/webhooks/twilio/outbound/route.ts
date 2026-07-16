import { NextResponse } from "next/server";
import { getTelephonyProvider } from "@/lib/providers";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

/**
 * Twilio outbound TwiML callback (legacy-compatible path).
 * Phase G: AI conversations are Retell-primary; this returns a short notice TwiML.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const telephony = getTelephonyProvider();
  const headers = new Headers(request.headers);
  const url = new URL(request.url);
  headers.set(
    "x-twilio-request-url",
    `${process.env.TWILIO_WEBHOOK_BASE_URL?.replace(/\/$/, "") || url.origin}${url.pathname}${url.search}`,
  );

  const valid = await telephony.verifyWebhook(headers, rawBody);
  if (telephony.name === "twilio" && !valid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const callSid = params.get("CallSid") ?? crypto.randomUUID();

  const claim = await claimWebhookEvent({
    provider: "twilio",
    idempotencyKey: `outbound:${callSid}`,
    eventType: "outbound_twiml",
    payload: Object.fromEntries(params.entries()),
  });
  if (claim.claimed) {
    await completeWebhookEvent(claim.eventId, { status: "processed" });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Connecting your call.</Say></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
