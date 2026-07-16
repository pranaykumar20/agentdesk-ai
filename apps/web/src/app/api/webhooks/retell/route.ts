import { NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/providers";
import { getJobsProvider } from "@/lib/jobs";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

/**
 * Retell webhook — verify signature, claim idempotency key, enqueue heavy work, return quickly.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const voice = getVoiceProvider();
  const valid = await voice.verifyWebhook(request.headers, rawBody);

  if (voice.name === "retell" && !valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: { event?: string; call?: { call_id?: string } };
  try {
    parsed = JSON.parse(rawBody) as typeof parsed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = parsed.event ?? "unknown";
  const callId = parsed.call?.call_id ?? "none";
  const idempotencyKey = `${event}:${callId}:${hashQuick(rawBody)}`;

  const claim = await claimWebhookEvent({
    provider: "retell",
    idempotencyKey,
    eventType: event,
    payload: parsed,
  });

  if (!claim.claimed) {
    return NextResponse.json({ received: true, duplicate: true, provider: voice.name });
  }

  try {
    const jobs = getJobsProvider();
    if (event === "call_ended") {
      await jobs.enqueue("process_retell_call_ended", { callId, raw: parsed });
    } else if (event === "call_analyzed") {
      await jobs.enqueue("process_retell_call_analyzed", { callId, raw: parsed });
    } else if (event === "call_started") {
      await jobs.enqueue("process_retell_call_ended", { callId, raw: parsed });
    }

    await completeWebhookEvent(claim.eventId, { status: "processed" });
    return NextResponse.json({ received: true, provider: voice.name, event, job: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    await completeWebhookEvent(claim.eventId, { status: "error", errorMessage: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function hashQuick(input: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(input.length, 2000); i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}
