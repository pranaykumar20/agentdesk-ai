import type { LiveCall, LiveMonitorMetrics } from "./types";

const store = new Map<string, LiveCall[]>();

function defaults(): LiveCall[] {
  return [
    {
      id: "live-1",
      callerName: "Emily Carter",
      callerPhone: "+1 (513) 555-0188",
      agentName: "Sarah M.",
      queueName: "Emergency",
      status: "in_progress",
      durationLabel: "04:18",
      sentiment: "negative",
      topic: "Tooth pain / same-day visit",
    },
    {
      id: "live-2",
      callerName: "James Nguyen",
      callerPhone: "+1 (513) 555-0112",
      agentName: "Mike D.",
      queueName: "Insurance",
      status: "in_progress",
      durationLabel: "02:41",
      sentiment: "neutral",
      topic: "Coverage verification",
    },
    {
      id: "live-3",
      callerName: "Unknown Caller",
      callerPhone: "+1 (859) 555-0190",
      agentName: "—",
      queueName: "Dental Support",
      status: "ringing",
      durationLabel: "00:22",
      sentiment: "neutral",
      topic: "Inbound — routing",
    },
    {
      id: "live-4",
      callerName: "Priya Shah",
      callerPhone: "+1 (513) 555-0166",
      agentName: "Lisa K.",
      queueName: "Scheduling",
      status: "on_hold",
      durationLabel: "06:05",
      sentiment: "positive",
      topic: "Invisalign consult",
    },
    {
      id: "live-5",
      callerName: "Marcus Lee",
      callerPhone: "+1 (513) 555-0144",
      agentName: "Alex M.",
      queueName: "Billing",
      status: "transferring",
      durationLabel: "01:12",
      sentiment: "neutral",
      topic: "Balance inquiry",
    },
  ];
}

export function listDemoLiveCalls(organizationId: string): LiveCall[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoLiveMetrics(calls: LiveCall[]): LiveMonitorMetrics {
  return {
    activeCalls: calls.filter((c) => c.status !== "ringing").length,
    ringing: calls.filter((c) => c.status === "ringing").length,
    agentsAvailable: 6,
    avgHandleLabel: "3m 48s",
  };
}
