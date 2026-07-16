import { NextResponse } from "next/server";
import { getBillingProvider } from "@/lib/providers";
import { handleStripeWebhookEvent } from "@/lib/providers/stripe/billing";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/webhooks/idempotency";

/**
 * Stripe webhook — signature verify, idempotency, subscription sync.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const billing = getBillingProvider();
  const valid = await billing.verifyWebhook(request.headers, rawBody);

  if (billing.name === "stripe" && !valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let eventId = "unknown";
  let eventType = "unknown";
  try {
    const parsed = JSON.parse(rawBody) as { id?: string; type?: string };
    eventId = parsed.id ?? eventId;
    eventType = parsed.type ?? eventType;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const claim = await claimWebhookEvent({
    provider: "stripe",
    idempotencyKey: eventId,
    eventType,
    payload: JSON.parse(rawBody) as unknown,
  });

  if (!claim.claimed) {
    return NextResponse.json({ received: true, duplicate: true, provider: billing.name });
  }

  try {
    const result = await handleStripeWebhookEvent(rawBody);
    await completeWebhookEvent(claim.eventId, { status: "processed" });
    return NextResponse.json({
      received: true,
      provider: billing.name,
      handled: result.handled,
      type: result.type ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe webhook failed";
    await completeWebhookEvent(claim.eventId, { status: "error", errorMessage: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
