export type WhatsappMessageStatus = "delivered" | "read" | "replied" | "failed" | "pending";

export type WhatsappConversation = {
  id: string;
  contactName: string;
  interest: string;
  phone: string;
  workflowName: string;
  lastMessage: string;
  status: WhatsappMessageStatus;
  relativeTime: string;
};

export type WhatsappMetrics = {
  messagesSent: number;
  messagesDelivered: number;
  readRate: number;
  responseRate: number;
  activeWorkflows: number;
};
