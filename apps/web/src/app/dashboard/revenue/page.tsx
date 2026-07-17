import { DollarSign, TrendingUp, Wallet, Percent, PhoneCall } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getRoiSummary } from "@/modules/roi/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revenue & ROI" };

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function RevenueRoiPage() {
  const { organization } = await requireOrg();
  const { metrics, sources, agents, insights } = await getRoiSummary(organization.id);
  const aiShare = ((metrics.aiAttributedCents / metrics.totalRevenueCents) * 100).toFixed(1);

  return (
    <div>
      <PageHeader
        title="Revenue & ROI Dashboard"
        description="Track revenue, costs, and ROI from your AI-powered operations."
      />

      <Tabs
        className="mb-6"
        activeId="overview"
        items={[
          { id: "overview", label: "Overview", href: "/dashboard/revenue" },
          { id: "sources", label: "Sources", href: "/dashboard/revenue" },
          { id: "agents", label: "AI Agents", href: "/dashboard/revenue" },
          { id: "costs", label: "Costs", href: "/dashboard/revenue" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Revenue"
          value={money(metrics.totalRevenueCents)}
          trend={18.6}
          icon={DollarSign}
        />
        <MetricCard
          label="AI Attributed Revenue"
          value={money(metrics.aiAttributedCents)}
          hint={`${aiShare}% of total revenue`}
          icon={TrendingUp}
          iconClassName="bg-violet-50 text-violet-600"
        />
        <MetricCard
          label="Total Cost (AI & Ops)"
          value={money(metrics.totalCostCents)}
          trend={-8.2}
          icon={Wallet}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Gross Profit"
          value={money(metrics.grossProfitCents)}
          trend={21.3}
        />
        <MetricCard
          label="ROI"
          value={`${metrics.roiPercent}%`}
          trend={32}
          icon={Percent}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Calls" value={metrics.totalCalls.toLocaleString()} icon={PhoneCall} />
        <MetricCard label="Appointments Booked" value={metrics.appointmentsBooked} />
        <MetricCard label="New Patients" value={metrics.newPatients} />
        <MetricCard label="Conversion Rate" value={`${metrics.conversionRate}%`} />
        <MetricCard label="Cost per Acquisition" value={money(metrics.costPerAcquisitionCents)} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sources.map((source) => (
                <div key={source.source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{source.source}</span>
                    <span className="tabular-nums font-medium text-foreground">{source.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${source.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top performing AI agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-success">+{agent.growthPct}% growth</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {money(agent.revenueCents)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ROI summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-success">{metrics.roiPercent}%</p>
              <p className="mt-1 text-sm text-muted-foreground">Excellent ROI</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment</span>
                  <span className="font-medium">{money(metrics.totalCostCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="font-medium">{money(metrics.grossProfitCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <p
                  key={insight}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                >
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
