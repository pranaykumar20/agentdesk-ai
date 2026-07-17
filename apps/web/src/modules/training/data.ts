import { demoTopTrainings, demoTrainingMetrics, listDemoTrainingJobs } from "./demo-data";

export async function listTrainingJobs(organizationId: string) {
  return listDemoTrainingJobs(organizationId);
}

export async function getTrainingSummary(organizationId: string) {
  const jobs = await listTrainingJobs(organizationId);
  return {
    jobs,
    metrics: demoTrainingMetrics(),
    topTrainings: demoTopTrainings(),
  };
}
