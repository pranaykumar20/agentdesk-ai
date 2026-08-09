import { NextResponse } from "next/server";
import { getJobsProvider } from "@/lib/jobs";
import { vapiVoiceProvider } from "@/lib/providers/vapi/voice";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

type VapiMessage = {
  type?: string;
  status?: string;
  call?: { id?: string };
};

/**
 * Vapi server URL — verify secret, claim idempotency key, enqueue sync work, return quickly.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const valid = await vapiVoiceProvider.verifyWebhook(request.headers, rawBody);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: { message?: VapiMessage };
  try {
    parsed = JSON.parse(rawBody) as typeof parsed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = parsed.message ?? {};
  const event = message.type ?? "unknown";
  const callId = message.call?.id ?? "none";
  const idempotencyKey = `${event}:${callId}:${hashQuick(rawBody)}`;

  const claim = await claimWebhookEvent({
    provider: "vapi",
    idempotencyKey,
    eventType: event,
    payload: parsed,
  });

  if (!claim.claimed) {
    return NextResponse.json({ received: true, duplicate: true, provider: "vapi" });
  }

  try {
    const jobs = getJobsProvider();
    if (event === "end-of-call-report") {
      await jobs.enqueue("process_vapi_end_of_call", { callId, raw: parsed });
    } else if (event === "status-update") {
      const status = (message.status ?? "").toLowerCase();
      if (status === "in-progress" || status === "ended" || status === "ringing") {
        await jobs.enqueue("process_vapi_status_update", { callId, raw: parsed });
      }
    }

    await completeWebhookEvent(claim.eventId, { status: "processed" });
    return NextResponse.json({ received: true, provider: "vapi", event, job: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Webhook processing failed";
    await completeWebhookEvent(claim.eventId, { status: "error", errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function hashQuick(input: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(input.length, 2000); i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}
