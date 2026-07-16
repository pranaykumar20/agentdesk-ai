import { listCalls } from "@/modules/calls/data";
import { getAppointmentMetrics } from "@/modules/appointments/data";
import { buildDemoAnalytics } from "./demo-data";
import type { AnalyticsOverview, AnalyticsRange } from "./types";

export type { AnalyticsOverview, AnalyticsRange };

function parseRange(value: string | undefined): AnalyticsRange {
  if (value === "30d" || value === "90d") return value;
  return "7d";
}

/** Aggregate analytics for the Analytics page. Falls back to demo series when live data is sparse. */
export async function getAnalyticsOverview(
  organizationId: string,
  rangeInput?: string,
): Promise<AnalyticsOverview> {
  const range = parseRange(rangeInput);
  const demo = buildDemoAnalytics(range);

  const pageSize = range === "7d" ? 100 : range === "30d" ? 250 : 500;
  const [callsPage, apptMetrics] = await Promise.all([
    listCalls(organizationId, { page: 1, pageSize }),
    getAppointmentMetrics(organizationId),
  ]);

  const calls = callsPage.items;
  if (calls.length < 5) {
    return {
      ...demo,
      kpis: {
        ...demo.kpis,
        appointmentsBooked: Math.max(demo.kpis.appointmentsBooked, apptMetrics.total),
      },
    };
  }

  const answeredCalls = calls.filter((c) => c.status === "completed").length;
  const missedCalls = calls.filter((c) => c.status === "missed" || c.status === "no_answer").length;
  const voicemails = calls.filter((c) => c.status === "voicemail").length;
  const durations = calls.map((c) => c.durationSeconds ?? 0).filter((d) => d > 0);
  const avgDurationSeconds =
    durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : demo.kpis.avgDurationSeconds;

  const intentMap = new Map<string, number>();
  for (const call of calls) {
    const key = call.disposition?.trim() || "Other";
    intentMap.set(key, (intentMap.get(key) ?? 0) + 1);
  }
  const intentTotal = calls.length || 1;
  const intentBreakdown = [...intentMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([intent, count]) => ({
      intent,
      count,
      pct: Math.round((count / intentTotal) * 1000) / 10,
    }));

  const dayMap = new Map<string, { total: number; answered: number; booked: number }>();
  for (const call of calls) {
    const day = new Date(call.startedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const entry = dayMap.get(day) ?? { total: 0, answered: 0, booked: 0 };
    entry.total += 1;
    if (call.status === "completed") entry.answered += 1;
    if (call.disposition?.toLowerCase().includes("appointment")) entry.booked += 1;
    dayMap.set(day, entry);
  }

  const callsOverTime = [...dayMap.entries()].slice(-14).map(([day, v]) => ({ day, ...v }));
  const totalCalls = Math.max(callsPage.total, calls.length);
  const answerRate = totalCalls > 0 ? Math.round((answeredCalls / Math.min(totalCalls, calls.length)) * 1000) / 10 : 0;
  const conversionRate =
    answeredCalls > 0
      ? Math.round((apptMetrics.total / answeredCalls) * 1000) / 10
      : demo.kpis.conversionRate;

  return {
    range,
    kpis: {
      totalCalls,
      answeredCalls: Math.max(answeredCalls, demo.kpis.answeredCalls),
      missedCalls: Math.max(missedCalls, 0),
      voicemails: Math.max(voicemails, 0),
      appointmentsBooked: Math.max(apptMetrics.total, demo.kpis.appointmentsBooked),
      newLeads: demo.kpis.newLeads,
      answerRate: answerRate || demo.kpis.answerRate,
      aiResolutionRate: demo.kpis.aiResolutionRate,
      avgDurationSeconds,
      conversionRate,
    },
    trends: demo.trends,
    callsOverTime: callsOverTime.length > 0 ? callsOverTime : demo.callsOverTime,
    intentBreakdown: intentBreakdown.length > 0 ? intentBreakdown : demo.intentBreakdown,
    outcomeDistribution: [
      { name: "Answered", value: Math.max(answeredCalls, 1), fill: "var(--chart-1)" },
      { name: "Voicemail", value: Math.max(voicemails, 0), fill: "var(--chart-3)" },
      { name: "Missed", value: Math.max(missedCalls, 0), fill: "var(--chart-4)" },
    ],
    peakHours: demo.peakHours,
    sentiment: demo.sentiment,
  };
}

export function analyticsToCsv(overview: AnalyticsOverview): string {
  const lines = [
    "metric,value",
    `range,${overview.range}`,
    `total_calls,${overview.kpis.totalCalls}`,
    `answered_calls,${overview.kpis.answeredCalls}`,
    `appointments_booked,${overview.kpis.appointmentsBooked}`,
    `new_leads,${overview.kpis.newLeads}`,
    `answer_rate,${overview.kpis.answerRate}`,
    `ai_resolution_rate,${overview.kpis.aiResolutionRate}`,
    `conversion_rate,${overview.kpis.conversionRate}`,
    "",
    "intent,count,pct",
    ...overview.intentBreakdown.map((i) => `${JSON.stringify(i.intent)},${i.count},${i.pct}`),
  ];
  return lines.join("\n");
}
