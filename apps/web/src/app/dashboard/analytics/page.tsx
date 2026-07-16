import { Phone, CalendarDays, UserPlus, Bot, Clock3, Target } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CallsChart } from "@/components/dashboard/CallsChart";
import { OutcomeChart } from "@/components/dashboard/OutcomeChart";
import { AnalyticsRangeTabs } from "@/components/analytics/AnalyticsRangeTabs";
import { ExportAnalyticsButton } from "@/components/analytics/ExportAnalyticsButton";
import { PeakHoursChart } from "@/components/analytics/PeakHoursChart";
import { getAnalyticsOverview } from "@/modules/analytics/overview";
import { formatDuration } from "@/lib/formatting/datetime";
import type { AnalyticsRange } from "@/modules/analytics/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { organization } = await requireOrg();
  const params = await searchParams;
  const range = (params.range === "30d" || params.range === "90d" ? params.range : "7d") as AnalyticsRange;
  const overview = await getAnalyticsOverview(organization.id, range);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Conversation volume, outcomes, intents, and conversion trends."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AnalyticsRangeTabs range={range} />
            <ExportAnalyticsButton range={range} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Total Calls"
          value={overview.kpis.totalCalls.toLocaleString()}
          trend={overview.trends.totalCalls}
          icon={Phone}
        />
        <MetricCard
          label="Appointments Booked"
          value={overview.kpis.appointmentsBooked.toLocaleString()}
          trend={overview.trends.appointmentsBooked}
          icon={CalendarDays}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="New Leads"
          value={overview.kpis.newLeads.toLocaleString()}
          trend={overview.trends.newLeads}
          icon={UserPlus}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <MetricCard
          label="AI Resolution"
          value={`${overview.kpis.aiResolutionRate}%`}
          trend={overview.trends.aiResolutionRate}
          icon={Bot}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Avg Duration"
          value={formatDuration(overview.kpis.avgDurationSeconds)}
          hint={`Answer rate ${overview.kpis.answerRate}%`}
          icon={Clock3}
        />
        <MetricCard
          label="Conversion Rate"
          value={`${overview.kpis.conversionRate}%`}
          hint="Bookings / answered calls"
          icon={Target}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Calls over time</h2>
          <p className="mt-1 text-xs text-muted-foreground">Total vs answered volume</p>
          <div className="mt-4">
            <CallsChart data={overview.callsOverTime} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Outcomes</h2>
          <p className="mt-1 text-xs text-muted-foreground">Distribution for selected range</p>
          <OutcomeChart data={overview.outcomeDistribution} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Top intents</h2>
          <p className="mt-1 text-xs text-muted-foreground">Why callers reached out</p>
          <ul className="mt-4 space-y-3">
            {overview.intentBreakdown.map((item) => (
              <li key={item.intent}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.intent}</span>
                  <span className="text-muted-foreground">
                    {item.count.toLocaleString()} · {item.pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, item.pct)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Peak hours</h2>
          <p className="mt-1 text-xs text-muted-foreground">Call volume by hour of day</p>
          <div className="mt-4">
            <PeakHoursChart data={overview.peakHours} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Sentiment mix</h2>
        <p className="mt-1 text-xs text-muted-foreground">Caller sentiment from completed conversations</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {overview.sentiment.map((s) => (
            <div key={s.label} className="rounded-lg border border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
