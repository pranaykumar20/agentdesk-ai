import { listCalls } from "@/modules/calls/data";
import { getAppointmentMetrics } from "@/modules/appointments/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import type { DashboardMetrics } from "./dashboard";

/**
 * Account metrics computed from org records — no demo padding.
 * Use this for Ava and any UI that must match real list totals.
 */
export async function getExactDashboardMetrics(
  organizationId: string,
): Promise<DashboardMetrics & { metricsSource: "computed_from_records" }> {
  const [allCalls, answered, missed, voicemails, sample, apptMetrics, crm] =
    await Promise.all([
      listCalls(organizationId, { page: 1, pageSize: 1 }),
      listCalls(organizationId, { tab: "answered", page: 1, pageSize: 1 }),
      listCalls(organizationId, { tab: "missed", page: 1, pageSize: 1 }),
      listCalls(organizationId, { tab: "voicemails", page: 1, pageSize: 1 }),
      listCalls(organizationId, { page: 1, pageSize: 100 }),
      getAppointmentMetrics(organizationId),
      getCrmPipelineSummary(organizationId),
    ]);

  const calls = sample.items;
  const totalCalls = allCalls.total;
  const answeredCalls = answered.total;
  const missedCalls = missed.total;
  const voicemailCount = voicemails.total;
  const durations = calls.map((c) => c.durationSeconds ?? 0).filter((d) => d > 0);
  const avgDurationSeconds =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
  const answerRate =
    totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 1000) / 10 : 0;

  const dayMap = new Map<string, { total: number; answered: number }>();
  for (const call of calls) {
    const day = new Date(call.startedAt).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
    const entry = dayMap.get(day) ?? { total: 0, answered: 0 };
    entry.total += 1;
    if (call.status === "completed") entry.answered += 1;
    dayMap.set(day, entry);
  }

  const callsOverTime = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    total: dayMap.get(day)?.total ?? 0,
    answered: dayMap.get(day)?.answered ?? 0,
  }));

  const resolvedSample = calls.filter(
    (c) => c.status === "completed" && c.disposition && c.disposition !== "escalated",
  ).length;
  const aiResolutionRate =
    calls.length > 0 ? Math.round((resolvedSample / calls.length) * 1000) / 10 : 0;

  return {
    metricsSource: "computed_from_records",
    totalCalls,
    answeredCalls,
    missedCalls,
    voicemails: voicemailCount,
    appointmentsBooked: apptMetrics.total,
    newLeads: crm.totalDeals,
    answerRate,
    avgDurationSeconds,
    aiResolutionRate,
    trends: {
      totalCalls: 0,
      answeredCalls: 0,
      appointmentsBooked: 0,
      newLeads: 0,
    },
    callsOverTime,
    outcomeDistribution: [
      { name: "Answered", value: answeredCalls, fill: "var(--chart-1)" },
      { name: "Voicemail", value: voicemailCount, fill: "var(--chart-3)" },
      { name: "Missed", value: missedCalls, fill: "var(--chart-4)" },
    ],
    topReasons: (() => {
      const counts = new Map<string, number>();
      for (const call of calls) {
        const reason = call.disposition?.trim() || "Other";
        counts.set(reason, (counts.get(reason) ?? 0) + 1);
      }
      const total = Math.max(
        1,
        [...counts.values()].reduce((a, b) => a + b, 0),
      );
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({
          reason,
          pct: Math.round((count / total) * 1000) / 10,
        }));
    })(),
  };
}
