import type { CallQueue, CallQueueMetrics } from "./types";

const store = new Map<string, CallQueue[]>();

function defaults(): CallQueue[] {
  return [
    {
      id: "q-1",
      name: "Dental Support",
      queueType: "General",
      status: "active",
      strategy: "round_robin",
      color: "bg-sky-500",
      callsInQueue: 4,
      agentsOnline: 6,
      agentsTotal: 8,
      avgWaitLabel: "1m 48s",
      longestWaitLabel: "4m 10s",
      abandoned: 1,
      abandonedRate: 6,
      serviceLevel: 92,
    },
    {
      id: "q-2",
      name: "Insurance",
      queueType: "Department",
      status: "active",
      strategy: "skills",
      color: "bg-amber-500",
      callsInQueue: 5,
      agentsOnline: 3,
      agentsTotal: 5,
      avgWaitLabel: "3m 22s",
      longestWaitLabel: "8m 12s",
      abandoned: 2,
      abandonedRate: 11,
      serviceLevel: 78,
    },
    {
      id: "q-3",
      name: "Appointment Scheduling",
      queueType: "General",
      status: "active",
      strategy: "round_robin",
      color: "bg-emerald-500",
      callsInQueue: 3,
      agentsOnline: 5,
      agentsTotal: 6,
      avgWaitLabel: "1m 05s",
      longestWaitLabel: "2m 40s",
      abandoned: 0,
      abandonedRate: 0,
      serviceLevel: 96,
    },
    {
      id: "q-4",
      name: "Billing & Payments",
      queueType: "Department",
      status: "active",
      strategy: "longest_idle",
      color: "bg-violet-500",
      callsInQueue: 2,
      agentsOnline: 2,
      agentsTotal: 4,
      avgWaitLabel: "2m 15s",
      longestWaitLabel: "5m 01s",
      abandoned: 1,
      abandonedRate: 8,
      serviceLevel: 84,
    },
    {
      id: "q-5",
      name: "Emergency",
      queueType: "Priority",
      status: "active",
      strategy: "priority",
      color: "bg-rose-500",
      callsInQueue: 3,
      agentsOnline: 4,
      agentsTotal: 4,
      avgWaitLabel: "0m 42s",
      longestWaitLabel: "1m 18s",
      abandoned: 0,
      abandonedRate: 0,
      serviceLevel: 99,
    },
    {
      id: "q-6",
      name: "After Hours",
      queueType: "Time Based",
      status: "inactive",
      strategy: "voicemail",
      color: "bg-slate-500",
      callsInQueue: 1,
      agentsOnline: 0,
      agentsTotal: 2,
      avgWaitLabel: "—",
      longestWaitLabel: "—",
      abandoned: 1,
      abandonedRate: 22,
      serviceLevel: 60,
    },
  ];
}

export function listDemoQueues(organizationId: string): CallQueue[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoQueueMetrics(queues: CallQueue[]): CallQueueMetrics {
  const active = queues.filter((q) => q.status === "active");
  return {
    totalQueues: active.length,
    callsInQueues: queues.reduce((sum, q) => sum + q.callsInQueue, 0),
    avgWaitLabel: "2m 34s",
    longestWaitLabel: "8m 12s",
    longestWaitQueue: "Insurance",
    abandoned: queues.reduce((sum, q) => sum + q.abandoned, 0),
  };
}
