export type ConversationChannel =
  | "call"
  | "sms"
  | "whatsapp"
  | "email"
  | "web_chat"
  | "social";

export type ConversationStatus = "open" | "pending" | "resolved" | "on_hold";

export type ContactConversation = {
  id: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  channel: ConversationChannel;
  subject: string;
  lastMessage: string;
  queueName: string;
  assigneeName: string;
  status: ConversationStatus;
  relativeTime: string;
  updatedAt: string;
};

export type ContactCenterMetrics = {
  open: number;
  newToday: number;
  slaCompliance: number;
  resolutionsToday: number;
  csat: number;
  agentsOnline: number;
  agentsTotal: number;
  callsInQueue: number;
  avgResponseLabel: string;
  longestWaitLabel: string;
};

export const CHANNEL_TABS: Array<{ id: "all" | ConversationChannel; label: string }> = [
  { id: "all", label: "All Channels" },
  { id: "call", label: "Calls" },
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
  { id: "web_chat", label: "Web Chat" },
  { id: "social", label: "Social" },
];
