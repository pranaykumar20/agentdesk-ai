export type LiveCallStatus = "ringing" | "in_progress" | "on_hold" | "transferring";

export type LiveCall = {
  id: string;
  callerName: string;
  callerPhone: string;
  agentName: string;
  queueName: string;
  status: LiveCallStatus;
  durationLabel: string;
  sentiment: "positive" | "neutral" | "negative";
  topic: string;
};

export type LiveMonitorMetrics = {
  activeCalls: number;
  ringing: number;
  agentsAvailable: number;
  avgHandleLabel: string;
};
