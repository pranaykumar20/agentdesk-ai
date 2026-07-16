export type PlanKey = "starter" | "professional" | "business";
export type BillingInterval = "month" | "year";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export type OrgSubscription = {
  organizationId: string;
  planKey: PlanKey;
  status: SubscriptionStatus;
  interval: BillingInterval;
  minutesIncluded: number;
  minutesUsed: number;
  overageMinutes: number;
  overagePerMinuteUsd: number;
  estimatedOverageUsd: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
};

export type UsageSnapshot = {
  planName: string;
  planKey: PlanKey;
  status: SubscriptionStatus;
  minutesUsed: number;
  minutesIncluded: number;
  usagePct: number;
  overageMinutes: number;
  estimatedOverageUsd: number;
};

export type InvoiceItem = {
  id: string;
  number: string;
  status: "paid" | "open" | "void" | "draft";
  amountUsd: number;
  currency: string;
  periodLabel: string;
  issuedAt: string;
  pdfUrl?: string;
};
