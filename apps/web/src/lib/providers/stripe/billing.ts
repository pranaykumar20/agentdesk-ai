import Stripe from "stripe";
import type { BillingProvider } from "../types";
import { planKeyFromPriceId } from "@/modules/billing/plans";
import { syncSubscriptionFromWebhook } from "@/modules/billing/data";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export const stripeBillingProvider: BillingProvider = {
  name: "stripe",

  async createCheckoutSession(input) {
    const stripe = getStripe();
    if (!stripe) {
      // Configured for stripe mode without keys — behave like mock checkout URL
      return { url: `${input.successUrl}?stripe_stub=1&price=${encodeURIComponent(input.priceId)}` };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer_email: input.customerEmail,
      client_reference_id: input.organizationId,
      metadata: {
        organization_id: input.organizationId,
        price_id: input.priceId,
      },
      subscription_data: {
        metadata: {
          organization_id: input.organizationId,
        },
      },
    });

    if (!session.url) throw new Error("Stripe checkout session missing URL");
    return { url: session.url };
  },

  async createCustomerPortalSession(input) {
    const stripe = getStripe();
    if (!stripe) {
      return { url: `${input.returnUrl}?stripe_portal_stub=1` };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  },

  async getSubscription(organizationId) {
    // Source of truth for app UI is modules/billing; Stripe API sync arrives via webhooks.
    void organizationId;
    return null;
  },

  async verifyWebhook(headers, rawBody) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      // In stripe mode without secret, accept only when not pretending to be production
      return process.env.NODE_ENV !== "production";
    }

    const stripe = getStripe();
    if (!stripe) return false;

    const signature = headers.get("stripe-signature");
    if (!signature) return false;

    try {
      stripe.webhooks.constructEvent(rawBody, signature, secret);
      return true;
    } catch {
      return false;
    }
  },
};

/** Process a verified Stripe (or stub) webhook payload into local subscription state. */
export async function handleStripeWebhookEvent(rawBody: string): Promise<{ handled: boolean; type?: string }> {
  let event: { type: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return { handled: false };
  }

  const obj = event.data?.object ?? {};
  const metadata = (obj.metadata as Record<string, string> | undefined) ?? {};
  const organizationId =
    metadata.organization_id ??
    (obj.client_reference_id as string | undefined) ??
    (typeof obj.metadata === "object" && obj.metadata && "organizationId" in (obj.metadata as object)
      ? String((obj.metadata as { organizationId?: string }).organizationId)
      : undefined);

  if (!organizationId) {
    return { handled: false, type: event.type };
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const priceId =
      metadata.price_id ??
      (obj.items as { data?: Array<{ price?: { id?: string } }> } | undefined)?.data?.[0]?.price?.id;
    const statusRaw = (obj.status as string | undefined) ?? "active";
    const status =
      statusRaw === "trialing" ||
      statusRaw === "active" ||
      statusRaw === "past_due" ||
      statusRaw === "canceled" ||
      statusRaw === "incomplete" ||
      statusRaw === "unpaid"
        ? statusRaw
        : "active";

    await syncSubscriptionFromWebhook({
      organizationId,
      status,
      planKey: priceId ? planKeyFromPriceId(priceId) ?? undefined : undefined,
      priceId,
      stripeSubscriptionId: typeof obj.id === "string" && obj.id.startsWith("sub_") ? obj.id : undefined,
    });
    return { handled: true, type: event.type };
  }

  if (event.type === "customer.subscription.deleted") {
    await syncSubscriptionFromWebhook({
      organizationId,
      status: "canceled",
    });
    return { handled: true, type: event.type };
  }

  return { handled: false, type: event.type };
}
