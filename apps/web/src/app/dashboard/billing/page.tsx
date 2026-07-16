import { requireOrg } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton, ManageBillingButton } from "@/components/billing/BillingActions";
import { PRICING_PLANS } from "@/modules/billing/plans";
import { computeUsageAlert, getOrgSubscription, getUsageSnapshot, listInvoices } from "@/modules/billing/data";
import { formatDate } from "@/lib/formatting/datetime";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing" };

function statusVariant(status: string) {
  if (status === "active" || status === "trialing") return "success" as const;
  if (status === "past_due" || status === "incomplete") return "warning" as const;
  return "destructive" as const;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string; plan?: string }>;
}) {
  const { organization, role } = await requireOrg();
  const params = await searchParams;
  const [subscription, usage, invoices] = await Promise.all([
    getOrgSubscription(organization.id),
    getUsageSnapshot(organization.id),
    listInvoices(organization.id),
  ]);
  const alert = computeUsageAlert(subscription);
  const canManage = can(role, "manage", "billing");

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Plan, usage, invoices, and Stripe customer portal."
        actions={canManage ? <ManageBillingButton /> : undefined}
      />

      {params.billing === "success" ? (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
          Checkout completed for {params.plan ?? "your plan"}. Subscription state is confirmed via Stripe webhooks
          (mock provider updates immediately).
        </div>
      ) : null}
      {params.billing === "cancel" ? (
        <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Checkout canceled. Your previous plan is unchanged.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current plan" value={usage.planName} hint={`Status: ${usage.status}`} />
        <MetricCard
          label="Minutes used"
          value={`${usage.minutesUsed.toLocaleString()} / ${usage.minutesIncluded.toLocaleString()}`}
          hint={`${usage.usagePct}% of included minutes`}
        />
        <MetricCard
          label="Overage"
          value={`${usage.overageMinutes.toLocaleString()} min`}
          hint={
            usage.estimatedOverageUsd > 0
              ? `Est. $${usage.estimatedOverageUsd.toFixed(2)}`
              : "No overage this period"
          }
        />
        <MetricCard
          label="Usage alert"
          value={alert === "ok" ? "Healthy" : alert === "warning" ? "Near limit" : "Over limit"}
          hint={alert === "ok" ? "Under 80% usage" : "Consider upgrading or adding minutes"}
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{usage.planName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription.interval === "year" ? "Annual" : "Monthly"} billing
              {subscription.currentPeriodEnd
                ? ` · renews ${formatDate(subscription.currentPeriodEnd, organization.timezone)}`
                : null}
            </p>
          </div>
          <Badge variant={statusVariant(subscription.status)}>{subscription.status}</Badge>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all",
              alert === "critical" ? "bg-destructive" : alert === "warning" ? "bg-warning" : "bg-primary",
            )}
            style={{ width: `${Math.min(100, usage.usagePct)}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">Available plans</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Display prices are for planning. Stripe price IDs from env are billing authority when connected.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const current = plan.id === subscription.planKey;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-xl border bg-card p-5 shadow-sm",
                  current ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  {current ? <Badge variant="success">Current</Badge> : null}
                  {plan.popular && !current ? <Badge>Popular</Badge> : null}
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  ${plan.monthlyPriceUsd}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <div className="mt-5">
                  {canManage ? (
                    current ? (
                      <ManageBillingButton />
                    ) : (
                      <CheckoutButton planKey={plan.id} label={`Choose ${plan.name}`} />
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">Only owners/admins can change plans.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Recent invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-3 py-3 font-medium">Period</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/70">
                  <td className="px-5 py-3 font-medium text-foreground">{inv.number}</td>
                  <td className="px-3 py-3 text-muted-foreground">{inv.periodLabel}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    ${inv.amountUsd.toFixed(2)} {inv.currency}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={inv.status === "paid" ? "success" : "secondary"}>{inv.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDate(inv.issuedAt, organization.timezone)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
