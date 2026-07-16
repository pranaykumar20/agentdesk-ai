export type AnalyticsRange = "7d" | "30d" | "90d";

export type AnalyticsOverview = {
  range: AnalyticsRange;
  kpis: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    voicemails: number;
    appointmentsBooked: number;
    newLeads: number;
    answerRate: number;
    aiResolutionRate: number;
    avgDurationSeconds: number;
    conversionRate: number;
  };
  trends: {
    totalCalls: number;
    appointmentsBooked: number;
    newLeads: number;
    aiResolutionRate: number;
  };
  callsOverTime: Array<{ day: string; total: number; answered: number; booked: number }>;
  intentBreakdown: Array<{ intent: string; count: number; pct: number }>;
  outcomeDistribution: Array<{ name: string; value: number; fill: string }>;
  peakHours: Array<{ hour: string; calls: number }>;
  sentiment: Array<{ label: string; value: number; fill: string }>;
};
