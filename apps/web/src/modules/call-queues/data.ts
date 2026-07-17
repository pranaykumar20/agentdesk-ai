import { demoQueueMetrics, listDemoQueues } from "./demo-data";

export async function listCallQueues(organizationId: string) {
  return listDemoQueues(organizationId);
}

export async function getCallQueueSummary(organizationId: string) {
  const queues = await listCallQueues(organizationId);
  return {
    queues,
    metrics: demoQueueMetrics(queues),
  };
}
