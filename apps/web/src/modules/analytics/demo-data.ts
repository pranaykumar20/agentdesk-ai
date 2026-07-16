import type { AnalyticsOverview, AnalyticsRange } from "./types";

function seriesForRange(range: AnalyticsRange) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const labels =
    days === 7
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : Array.from({ length: Math.min(days, 14) }, (_, i) => `D${i + 1}`);

  return labels.map((day, i) => {
    const total = 90 + ((i * 17) % 80);
    const answered = Math.round(total * 0.9);
    const booked = Math.round(answered * 0.28);
    return { day, total, answered, booked };
  });
}

export function buildDemoAnalytics(range: AnalyticsRange): AnalyticsOverview {
  const multiplier = range === "7d" ? 1 : range === "30d" ? 4.2 : 12;
  const callsOverTime = seriesForRange(range);

  const totalCalls = Math.round(1248 * multiplier);
  const answeredCalls = Math.round(1126 * multiplier);
  const missedCalls = Math.round(40 * multiplier);
  const voicemails = Math.round(82 * multiplier);
  const appointmentsBooked = Math.round(328 * multiplier);
  const newLeads = Math.round(287 * multiplier);

  return {
    range,
    kpis: {
      totalCalls,
      answeredCalls,
      missedCalls,
      voicemails,
      appointmentsBooked,
      newLeads,
      answerRate: 90.2,
      aiResolutionRate: 87.3,
      avgDurationSeconds: 154,
      conversionRate: 26.3,
    },
    trends: {
      totalCalls: 18.5,
      appointmentsBooked: 15.7,
      newLeads: 22.1,
      aiResolutionRate: 3.4,
    },
    callsOverTime,
    intentBreakdown: [
      { intent: "Book Appointment", count: Math.round(totalCalls * 0.45), pct: 45 },
      { intent: "Insurance Inquiry", count: Math.round(totalCalls * 0.18), pct: 18 },
      { intent: "Office Hours", count: Math.round(totalCalls * 0.14), pct: 14 },
      { intent: "Billing", count: Math.round(totalCalls * 0.12), pct: 12 },
      { intent: "Other", count: Math.round(totalCalls * 0.11), pct: 11 },
    ],
    outcomeDistribution: [
      { name: "Answered", value: answeredCalls, fill: "var(--chart-1)" },
      { name: "Voicemail", value: voicemails, fill: "var(--chart-3)" },
      { name: "Missed", value: missedCalls, fill: "var(--chart-4)" },
    ],
    peakHours: [
      { hour: "8am", calls: Math.round(42 * multiplier) },
      { hour: "9am", calls: Math.round(88 * multiplier) },
      { hour: "10am", calls: Math.round(110 * multiplier) },
      { hour: "11am", calls: Math.round(95 * multiplier) },
      { hour: "12pm", calls: Math.round(70 * multiplier) },
      { hour: "1pm", calls: Math.round(78 * multiplier) },
      { hour: "2pm", calls: Math.round(102 * multiplier) },
      { hour: "3pm", calls: Math.round(96 * multiplier) },
      { hour: "4pm", calls: Math.round(84 * multiplier) },
      { hour: "5pm", calls: Math.round(55 * multiplier) },
    ],
    sentiment: [
      { label: "Positive", value: 72, fill: "var(--chart-2)" },
      { label: "Neutral", value: 22, fill: "var(--chart-3)" },
      { label: "Negative", value: 6, fill: "var(--chart-4)" },
    ],
  };
}
