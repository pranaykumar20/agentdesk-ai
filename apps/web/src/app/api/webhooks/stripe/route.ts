import { NextResponse } from "next/server";
import { getBillingProvider } from "@/lib/providers";
import { handleStripeWebhookEvent } from "@/lib/providers/stripe/billing";

/**
 * Stripe webhook endpoint — verifies signature (when configured) and syncs subscription state.
 * Checkout success redirects alone must not be treated as billing authority.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const billing = getBillingProvider();
  const valid = await billing.verifyWebhook(request.headers, rawBody);

  if (billing.name === "stripe" && !valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await handleStripeWebhookEvent(rawBody);
  return NextResponse.json({
    received: true,
    provider: billing.name,
    handled: result.handled,
    type: result.type ?? null,
  });
}
