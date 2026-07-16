import Link from "next/link";
import { CalendarDays, CheckCircle2, Phone, UserPlus } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CallsChart } from "@/components/dashboard/CallsChart";
import { OutcomeChart } from "@/components/dashboard/OutcomeChart";
import { AppointmentStatusBadge, CallStatusBadge } from "@/components/dashboard/StatusBadge";
import { getDashboardMetrics } from "@/modules/analytics/dashboard";
import { getRecentCalls } from "@/modules/calls/data";
import { getUpcomingAppointments } from "@/modules/appointments/data";
import { formatDateTime, formatDuration, formatTime } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { organization } = await requireOrg();
  const [metrics, recentCalls, upcoming] = await Promise.all([
    getDashboardMetrics(organization.id),
    getRecentCalls(organization.id, 5),
    getUpcomingAppointments(organization.id, 3),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Week overview for ${organization.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          trend={metrics.trends.totalCalls}
          icon={Phone}
        />
        <MetricCard
          label="Answered Calls"
          value={metrics.answeredCalls.toLocaleString()}
          trend={metrics.trends.answeredCalls}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Appointments Booked"
          value={metrics.appointmentsBooked.toLocaleString()}
          trend={metrics.trends.appointmentsBooked}
          icon={CalendarDays}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="New Leads"
          value={metrics.newLeads.toLocaleString()}
          trend={metrics.trends.newLeads}
          icon={UserPlus}
          iconClassName="bg-sky-50 text-sky-600"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Call overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">Total vs answered calls this week</p>
          <div className="mt-4">
            <CallsChart data={metrics.callsOverTime} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Call distribution</h2>
          <p className="mt-1 text-xs text-muted-foreground">Outcome mix</p>
          <OutcomeChart data={metrics.outcomeDistribution} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming appointments</h2>
            <Link href="/dashboard/appointments" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <li className="text-sm text-muted-foreground">No upcoming appointments.</li>
            ) : (
              upcoming.map((appt) => (
                <li key={appt.id} className="rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{appt.contactName}</p>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTime(appt.startsAt, organization.timezone)} · {appt.serviceName}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Top call reasons</h2>
          <ul className="mt-4 space-y-3">
            {metrics.topReasons.map((reason) => (
              <li key={reason.reason}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{reason.reason}</span>
                  <span className="text-muted-foreground">{reason.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${reason.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">AI agent performance</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Avg. response time</dt>
              <dd className="font-medium text-foreground">1.2 sec</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Resolution rate</dt>
              <dd className="font-medium text-success">{metrics.aiResolutionRate}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Customer satisfaction</dt>
              <dd className="font-medium text-foreground">4.7 / 5</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Escalation rate</dt>
              <dd className="font-medium text-foreground">8.1%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Avg. duration</dt>
              <dd className="font-medium text-foreground">{formatDuration(metrics.avgDurationSeconds)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Recent calls</h2>
          <Link href="/dashboard/calls" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Caller</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Duration</th>
                <th className="px-3 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b border-border/70">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/calls/${call.id}`} className="font-medium text-foreground hover:text-primary">
                      {call.callerName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{call.callerPhone}</p>
                  </td>
                  <td className="px-3 py-3">
                    <CallStatusBadge status={call.status} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDuration(call.durationSeconds)}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(call.startedAt, organization.timezone)}
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
