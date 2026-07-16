import type { BillingProvider } from "../types";
import { planKeyFromPriceId } from "@/modules/billing/plans";
import { applyCheckoutToDemo, getDemoSubscription } from "@/modules/billing/demo-data";

export const mockBillingProvider: BillingProvider = {
  name: "mock",

  async createCheckoutSession(input) {
    const planKey = planKeyFromPriceId(input.priceId) ?? "professional";
    const interval = input.priceId.includes("year") || input.priceId.includes("annual") ? "year" : "month";
    applyCheckoutToDemo(input.organizationId, planKey, interval);
    return { url: `${input.successUrl}?mock_checkout=1&plan=${planKey}` };
  },

  async createCustomerPortalSession(input) {
    return { url: `${input.returnUrl}?mock_portal=1` };
  },

  async getSubscription(organizationId) {
    const sub = getDemoSubscription(organizationId);
    return { status: sub.status, planKey: sub.planKey };
  },

  async verifyWebhook() {
    return process.env.NODE_ENV !== "production";
  },
};
