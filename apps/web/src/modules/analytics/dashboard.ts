import { getExactDashboardMetrics } from "./exact-metrics";

export type DashboardMetrics = {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  voicemails: number;
  appointmentsBooked: number;
  newLeads: number;
  answerRate: number;
  avgDurationSeconds: number;
  aiResolutionRate: number;
  trends: {
    totalCalls: number;
    answeredCalls: number;
    appointmentsBooked: number;
    newLeads: number;
  };
  callsOverTime: Array<{ day: string; total: number; answered: number }>;
  outcomeDistribution: Array<{ name: string; value: number; fill: string }>;
  topReasons: Array<{ reason: string; pct: number }>;
};

/** Exact org metrics (no demo padding). Shared by Dashboard UI and Ava. */
export async function getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
  const exact = await getExactDashboardMetrics(organizationId);
  const { metricsSource: _metricsSource, ...metrics } = exact;
  void _metricsSource;
  return metrics;
}
