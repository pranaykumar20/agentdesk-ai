import { PRICING_PLANS, type PricingPlan } from "@/lib/marketing/pricing";
import type { BillingInterval, PlanKey } from "./types";

export function getPlan(planKey: PlanKey): PricingPlan {
  return PRICING_PLANS.find((p) => p.id === planKey) ?? PRICING_PLANS[0]!;
}

export function planDisplayName(planKey: PlanKey): string {
  return `${getPlan(planKey).name} Plan`;
}

export function resolveStripePriceId(planKey: PlanKey, interval: BillingInterval): string {
  const plan = getPlan(planKey);
  const envName = interval === "year" ? plan.stripePriceEnvAnnual : plan.stripePriceEnvMonthly;
  const fromEnv = process.env[envName]?.trim();
  if (fromEnv) return fromEnv;
  return `price_mock_${planKey}_${interval}`;
}

export function planKeyFromPriceId(priceId: string): PlanKey | null {
  const normalized = priceId.toLowerCase();
  if (normalized.includes("business")) return "business";
  if (normalized.includes("professional") || normalized.includes("pro")) return "professional";
  if (normalized.includes("starter")) return "starter";

  for (const plan of PRICING_PLANS) {
    const monthly = process.env[plan.stripePriceEnvMonthly]?.trim();
    const annual = process.env[plan.stripePriceEnvAnnual]?.trim();
    if (priceId === monthly || priceId === annual) return plan.id;
  }
  return null;
}

export { PRICING_PLANS };
