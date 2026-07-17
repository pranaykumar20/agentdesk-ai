import type { WhatsappConversation, WhatsappMetrics } from "./types";

const store = new Map<string, WhatsappConversation[]>();

function defaults(): WhatsappConversation[] {
  return [
    {
      id: "wa-1",
      contactName: "Ava Green",
      interest: "Insurance Inquiry",
      phone: "+1 (513) •••• 0182",
      workflowName: "Insurance Inquiry",
      lastMessage: "Do you accept Delta Dental PPO?",
      status: "replied",
      relativeTime: "4m ago",
    },
    {
      id: "wa-2",
      contactName: "Noah Patel",
      interest: "Appointment Booking",
      phone: "+1 (513) •••• 0144",
      workflowName: "Appointment Booking",
      lastMessage: "Tuesday at 3pm works for me.",
      status: "read",
      relativeTime: "12m ago",
    },
    {
      id: "wa-3",
      contactName: "Mia Torres",
      interest: "Whitening Promo",
      phone: "+1 (859) •••• 0110",
      workflowName: "Promotional Offer",
      lastMessage: "Is the special still available?",
      status: "delivered",
      relativeTime: "28m ago",
    },
    {
      id: "wa-4",
      contactName: "Liam Brooks",
      interest: "Billing Question",
      phone: "+1 (513) •••• 0199",
      workflowName: "Billing Support",
      lastMessage: "Can I pay the balance online?",
      status: "pending",
      relativeTime: "1h ago",
    },
  ];
}

export function listDemoWhatsappConversations(organizationId: string): WhatsappConversation[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoWhatsappMetrics(): WhatsappMetrics {
  return {
    messagesSent: 8756,
    messagesDelivered: 8432,
    readRate: 92.8,
    responseRate: 18.7,
    activeWorkflows: 16,
  };
}

export function demoWhatsappWorkflows() {
  return [
    { name: "Appointment Booking", volume: 1240, pct: 92 },
    { name: "Insurance Inquiry", volume: 980, pct: 84 },
    { name: "Billing Support", volume: 640, pct: 71 },
    { name: "Promotional Offer", volume: 510, pct: 63 },
    { name: "Missed Call Follow-up", volume: 420, pct: 58 },
  ];
}
