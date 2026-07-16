import { NextResponse } from "next/server";
import { getTelephonyProvider } from "@/lib/providers";
import { getJobsProvider } from "@/lib/jobs";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

/**
 * Twilio call status callback — verified + idempotent.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const telephony = getTelephonyProvider();
  const headers = new Headers(request.headers);
  const url = new URL(request.url);
  headers.set(
    "x-twilio-request-url",
    `${process.env.TWILIO_WEBHOOK_BASE_URL?.replace(/\/$/, "") || url.origin}${url.pathname}`,
  );

  const valid = await telephony.verifyWebhook(headers, rawBody);
  if (telephony.name === "twilio" && !valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const callSid = params.get("CallSid") ?? "";
  const callStatus = (params.get("CallStatus") ?? "").toLowerCase();

  if (!callSid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const claim = await claimWebhookEvent({
    provider: "twilio",
    idempotencyKey: `status:${callSid}:${callStatus}`,
    eventType: "call_status",
    payload: Object.fromEntries(params.entries()),
  });

  if (!claim.claimed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await getJobsProvider().enqueue("process_twilio_status", {
      callSid,
      status: callStatus,
      raw: Object.fromEntries(params.entries()),
    });
    await completeWebhookEvent(claim.eventId, { status: "processed" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status webhook failed";
    await completeWebhookEvent(claim.eventId, { status: "error", errorMessage: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
