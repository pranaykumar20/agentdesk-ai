import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  applyCheckoutToDemo,
  getDemoSubscription,
  listDemoInvoices,
  setDemoSubscription,
  withUsageDerived,
} from "./demo-data";
import { getPlan, planDisplayName, planKeyFromPriceId, resolveStripePriceId } from "./plans";
import type {
  BillingInterval,
  InvoiceItem,
  OrgSubscription,
  PlanKey,
  SubscriptionStatus,
  UsageSnapshot,
} from "./types";

function toUsageSnapshot(sub: OrgSubscription): UsageSnapshot {
  const usagePct =
    sub.minutesIncluded > 0
      ? Math.min(100, Math.round((sub.minutesUsed / sub.minutesIncluded) * 1000) / 10)
      : 0;
  return {
    planName: planDisplayName(sub.planKey),
    planKey: sub.planKey,
    status: sub.status,
    minutesUsed: sub.minutesUsed,
    minutesIncluded: sub.minutesIncluded,
    usagePct,
    overageMinutes: sub.overageMinutes,
    estimatedOverageUsd: sub.estimatedOverageUsd,
  };
}

function normalizePlanKey(value: string | null | undefined): PlanKey {
  if (value === "business" || value === "professional" || value === "starter") return value;
  return "starter";
}

function normalizeStatus(value: string | null | undefined): SubscriptionStatus {
  const allowed: SubscriptionStatus[] = [
    "trialing",
    "active",
    "past_due",
    "canceled",
    "incomplete",
    "unpaid",
  ];
  if (value && (allowed as string[]).includes(value)) return value as SubscriptionStatus;
  return "trialing";
}

async function loadFromSupabase(organizationId: string): Promise<OrgSubscription | null> {
  if (!getSupabaseEnv().configured) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select(
        "plan_key, status, minutes_included, minutes_used, stripe_subscription_id, current_period_start, current_period_end",
      )
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (!data) return null;

    const planKey = normalizePlanKey(data.plan_key);
    const plan = getPlan(planKey);
    return withUsageDerived({
      organizationId,
      planKey,
      status: normalizeStatus(data.status),
      interval: "month",
      minutesIncluded: data.minutes_included,
      minutesUsed: data.minutes_used,
      overageMinutes: 0,
      overagePerMinuteUsd: plan.overagePerMinuteUsd,
      estimatedOverageUsd: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: data.stripe_subscription_id,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      trialEndsAt: null,
    });
  } catch {
    return null;
  }
}

export async function getOrgSubscription(organizationId: string): Promise<OrgSubscription> {
  const fromDb = await loadFromSupabase(organizationId);
  if (fromDb) {
    setDemoSubscription(organizationId, fromDb);
    return fromDb;
  }
  return getDemoSubscription(organizationId);
}

export async function getUsageSnapshot(organizationId: string): Promise<UsageSnapshot> {
  const sub = await getOrgSubscription(organizationId);
  return toUsageSnapshot(sub);
}

export async function listInvoices(organizationId: string): Promise<InvoiceItem[]> {
  return listDemoInvoices(organizationId);
}

export async function startCheckout(input: {
  organizationId: string;
  planKey: PlanKey;
  interval: BillingInterval;
}): Promise<{ priceId: string; planKey: PlanKey; interval: BillingInterval }> {
  const priceId = resolveStripePriceId(input.planKey, input.interval);
  return { priceId, planKey: input.planKey, interval: input.interval };
}

/** Apply local subscription update after successful mock checkout (Stripe uses webhooks). */
export async function recordMockCheckout(
  organizationId: string,
  planKey: PlanKey,
  interval: BillingInterval,
): Promise<OrgSubscription> {
  return applyCheckoutToDemo(organizationId, planKey, interval);
}

export async function syncSubscriptionFromWebhook(input: {
  organizationId: string;
  status: SubscriptionStatus;
  planKey?: PlanKey;
  priceId?: string;
  stripeSubscriptionId?: string;
  minutesUsed?: number;
}): Promise<OrgSubscription> {
  const current = await getOrgSubscription(input.organizationId);
  const planKey =
    input.planKey ??
    (input.priceId ? planKeyFromPriceId(input.priceId) : null) ??
    current.planKey;
  const plan = getPlan(planKey);

  return setDemoSubscription(input.organizationId, {
    ...current,
    planKey,
    status: input.status,
    minutesIncluded: plan.minutesIncluded,
    overagePerMinuteUsd: plan.overagePerMinuteUsd,
    minutesUsed: input.minutesUsed ?? current.minutesUsed,
    stripeSubscriptionId: input.stripeSubscriptionId ?? current.stripeSubscriptionId,
  });
}

export function computeUsageAlert(sub: OrgSubscription): "ok" | "warning" | "critical" {
  const pct = sub.minutesIncluded > 0 ? sub.minutesUsed / sub.minutesIncluded : 0;
  if (pct >= 1) return "critical";
  if (pct >= 0.8) return "warning";
  return "ok";
}
