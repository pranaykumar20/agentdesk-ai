import type { TrainingJob, TrainingMetrics } from "./types";

const store = new Map<string, TrainingJob[]>();

function defaults(): TrainingJob[] {
  return [
    {
      id: "tr-1",
      name: "Dental FAQ Training",
      agentName: "Dental Assistant AI",
      datasetName: "Clinic FAQ v3",
      source: "Knowledge Base",
      accuracy: 94.8,
      status: "completed",
      lastTrainedAt: "2025-05-18T10:00:00.000Z",
    },
    {
      id: "tr-2",
      name: "Appointment Scheduling",
      agentName: "Scheduling AI",
      datasetName: "Booking Dialogs",
      source: "Documents",
      accuracy: 96.2,
      status: "completed",
      lastTrainedAt: "2025-05-17T15:20:00.000Z",
    },
    {
      id: "tr-3",
      name: "Insurance Verification",
      agentName: "Insurance AI",
      datasetName: "Payer Scripts",
      source: "Web Import",
      accuracy: 91.1,
      status: "completed",
      lastTrainedAt: "2025-05-16T09:40:00.000Z",
    },
    {
      id: "tr-4",
      name: "Treatment Explanation",
      agentName: "Treatment AI",
      datasetName: "Procedure Scripts",
      source: "Manual Entry",
      accuracy: 89.3,
      status: "running",
      lastTrainedAt: null,
    },
    {
      id: "tr-5",
      name: "Payment & Billing",
      agentName: "Billing AI",
      datasetName: "Billing FAQs",
      source: "Knowledge Base",
      accuracy: 87.6,
      status: "queued",
      lastTrainedAt: null,
    },
  ];
}

export function listDemoTrainingJobs(organizationId: string): TrainingJob[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoTrainingMetrics(): TrainingMetrics {
  return {
    totalTrainings: 24,
    datasets: 16,
    conversationsAnalyzed: 18245,
    modelAccuracy: 92.6,
    evaluationsPassed: 18,
  };
}

export function demoTopTrainings() {
  return [
    { name: "Appointment Scheduling", accuracy: 96.2 },
    { name: "Dental FAQ Training", accuracy: 94.8 },
    { name: "Insurance Verification", accuracy: 91.1 },
    { name: "Treatment Explanation", accuracy: 89.3 },
    { name: "Payment & Billing", accuracy: 87.6 },
  ];
}
