import type { InvoiceItem, OrgSubscription, PlanKey, SubscriptionStatus } from "./types";
import { getPlan } from "./plans";

const store = new Map<string, OrgSubscription>();

function defaultSubscription(organizationId: string): OrgSubscription {
  const plan = getPlan("professional");
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return {
    organizationId,
    planKey: "professional",
    status: "active",
    interval: "month",
    minutesIncluded: plan.minutesIncluded,
    minutesUsed: 2500,
    overageMinutes: 0,
    overagePerMinuteUsd: plan.overagePerMinuteUsd,
    estimatedOverageUsd: 0,
    stripeCustomerId: `cus_mock_${organizationId.slice(0, 8)}`,
    stripeSubscriptionId: `sub_mock_${organizationId.slice(0, 8)}`,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    trialEndsAt: null,
  };
}

export function getDemoSubscription(organizationId: string): OrgSubscription {
  const existing = store.get(organizationId);
  if (existing) return withUsageDerived(existing);
  const created = withUsageDerived(defaultSubscription(organizationId));
  store.set(organizationId, created);
  return created;
}

export function setDemoSubscription(organizationId: string, sub: OrgSubscription): OrgSubscription {
  const next = withUsageDerived(sub);
  store.set(organizationId, next);
  return next;
}

export function withUsageDerived(sub: OrgSubscription): OrgSubscription {
  const overageMinutes = Math.max(0, sub.minutesUsed - sub.minutesIncluded);
  return {
    ...sub,
    overageMinutes,
    estimatedOverageUsd: Math.round(overageMinutes * sub.overagePerMinuteUsd * 100) / 100,
  };
}

export function applyCheckoutToDemo(
  organizationId: string,
  planKey: PlanKey,
  interval: "month" | "year",
): OrgSubscription {
  const plan = getPlan(planKey);
  const current = getDemoSubscription(organizationId);
  return setDemoSubscription(organizationId, {
    ...current,
    planKey,
    interval,
    status: "active",
    minutesIncluded: plan.minutesIncluded,
    overagePerMinuteUsd: plan.overagePerMinuteUsd,
    stripeSubscriptionId: `sub_mock_${planKey}_${Date.now().toString(36)}`,
  });
}

export function applyWebhookStatus(
  organizationId: string,
  status: SubscriptionStatus,
  planKey?: PlanKey,
): OrgSubscription {
  const current = getDemoSubscription(organizationId);
  const plan = getPlan(planKey ?? current.planKey);
  return setDemoSubscription(organizationId, {
    ...current,
    status,
    planKey: plan.id,
    minutesIncluded: plan.minutesIncluded,
    overagePerMinuteUsd: plan.overagePerMinuteUsd,
  });
}

export function listDemoInvoices(organizationId: string): InvoiceItem[] {
  void organizationId;
  const now = Date.now();
  return [
    {
      id: "inv-001",
      number: "INV-2026-0312",
      status: "paid",
      amountUsd: 199,
      currency: "USD",
      periodLabel: "Mar 2026",
      issuedAt: new Date(now - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
    {
      id: "inv-002",
      number: "INV-2026-0212",
      status: "paid",
      amountUsd: 199,
      currency: "USD",
      periodLabel: "Feb 2026",
      issuedAt: new Date(now - 1000 * 60 * 60 * 24 * 42).toISOString(),
    },
    {
      id: "inv-003",
      number: "INV-2026-0112",
      status: "paid",
      amountUsd: 199,
      currency: "USD",
      periodLabel: "Jan 2026",
      issuedAt: new Date(now - 1000 * 60 * 60 * 24 * 72).toISOString(),
    },
  ];
}
