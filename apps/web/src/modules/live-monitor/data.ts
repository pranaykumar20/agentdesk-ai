import { demoLiveMetrics, listDemoLiveCalls } from "./demo-data";

export async function listLiveCalls(organizationId: string) {
  return listDemoLiveCalls(organizationId);
}

export async function getLiveMonitorSummary(organizationId: string) {
  const calls = await listLiveCalls(organizationId);
  return {
    calls,
    metrics: demoLiveMetrics(calls),
  };
}
