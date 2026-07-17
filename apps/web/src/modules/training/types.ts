export type TrainingJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type TrainingJob = {
  id: string;
  name: string;
  agentName: string;
  datasetName: string;
  source: string;
  accuracy: number;
  status: TrainingJobStatus;
  lastTrainedAt: string | null;
};

export type TrainingMetrics = {
  totalTrainings: number;
  datasets: number;
  conversationsAnalyzed: number;
  modelAccuracy: number;
  evaluationsPassed: number;
};
