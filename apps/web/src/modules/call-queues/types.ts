export type QueueStatus = "active" | "inactive";

export type CallQueue = {
  id: string;
  name: string;
  queueType: string;
  status: QueueStatus;
  strategy: string;
  color: string;
  callsInQueue: number;
  agentsOnline: number;
  agentsTotal: number;
  avgWaitLabel: string;
  longestWaitLabel: string;
  abandoned: number;
  abandonedRate: number;
  serviceLevel: number;
};

export type CallQueueMetrics = {
  totalQueues: number;
  callsInQueues: number;
  avgWaitLabel: string;
  longestWaitLabel: string;
  longestWaitQueue: string;
  abandoned: number;
};
