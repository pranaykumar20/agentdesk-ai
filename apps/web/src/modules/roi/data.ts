import {
  demoRoiAgents,
  demoRoiInsights,
  demoRoiMetrics,
  demoRoiSources,
} from "./demo-data";

export async function getRoiSummary(_organizationId: string) {
  return {
    metrics: demoRoiMetrics(),
    sources: demoRoiSources(),
    agents: demoRoiAgents(),
    insights: demoRoiInsights(),
  };
}
