import type { ContactConversation, ContactCenterMetrics } from "./types";

const store = new Map<string, ContactConversation[]>();

function defaults(): ContactConversation[] {
  const now = new Date().toISOString();
  return [
    {
      id: "cc-1",
      contactName: "Emily Carter",
      contactPhone: "+1 (513) 555-0188",
      contactEmail: null,
      channel: "call",
      subject: "Emergency tooth pain",
      lastMessage: "Caller needs same-day appointment.",
      queueName: "Emergency",
      assigneeName: "Sarah M.",
      status: "open",
      relativeTime: "2m ago",
      updatedAt: now,
    },
    {
      id: "cc-2",
      contactName: "James Nguyen",
      contactPhone: "+1 (513) 555-0112",
      contactEmail: null,
      channel: "sms",
      subject: "Insurance verification",
      lastMessage: "Can you confirm Delta Dental coverage?",
      queueName: "Insurance",
      assigneeName: "Mike D.",
      status: "pending",
      relativeTime: "5m ago",
      updatedAt: now,
    },
    {
      id: "cc-3",
      contactName: "Priya Shah",
      contactPhone: null,
      contactEmail: "priya@example.com",
      channel: "email",
      subject: "Invisalign consult follow-up",
      lastMessage: "Thanks — please send available times.",
      queueName: "Scheduling",
      assigneeName: "Lisa K.",
      status: "open",
      relativeTime: "12m ago",
      updatedAt: now,
    },
    {
      id: "cc-4",
      contactName: "Marcus Lee",
      contactPhone: "+1 (513) 555-0144",
      contactEmail: null,
      channel: "whatsapp",
      subject: "Billing question",
      lastMessage: "Is my balance due before the visit?",
      queueName: "Billing",
      assigneeName: "You",
      status: "open",
      relativeTime: "18m ago",
      updatedAt: now,
    },
    {
      id: "cc-5",
      contactName: "Ana Morales",
      contactPhone: null,
      contactEmail: null,
      channel: "web_chat",
      subject: "New patient intake",
      lastMessage: "Looking for a cleaning next week.",
      queueName: "Dental Support",
      assigneeName: "Alex M.",
      status: "resolved",
      relativeTime: "34m ago",
      updatedAt: now,
    },
    {
      id: "cc-6",
      contactName: "Chris Baker",
      contactPhone: null,
      contactEmail: null,
      channel: "social",
      subject: "Instagram DM — whitening promo",
      lastMessage: "Is the offer still available?",
      queueName: "General",
      assigneeName: "Tiffany S.",
      status: "pending",
      relativeTime: "1h ago",
      updatedAt: now,
    },
  ];
}

export function listDemoConversations(organizationId: string): ContactConversation[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoContactCenterMetrics(): ContactCenterMetrics {
  return {
    open: 32,
    newToday: 48,
    slaCompliance: 96,
    resolutionsToday: 27,
    csat: 4.6,
    agentsOnline: 12,
    agentsTotal: 18,
    callsInQueue: 5,
    avgResponseLabel: "1m 24s",
    longestWaitLabel: "3m 12s",
  };
}

export function demoQueueOverview() {
  return [
    { name: "Dental Support", count: 8 },
    { name: "Insurance", count: 6 },
    { name: "Scheduling", count: 7 },
    { name: "Billing", count: 4 },
    { name: "Emergency", count: 3 },
    { name: "General", count: 4 },
  ];
}

export function demoTopAgents() {
  return [
    { name: "Sarah M.", resolutions: 14 },
    { name: "Mike D.", resolutions: 11 },
    { name: "Lisa K.", resolutions: 9 },
    { name: "Alex M.", resolutions: 8 },
    { name: "Tiffany S.", resolutions: 7 },
  ];
}
