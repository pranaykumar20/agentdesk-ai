export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "needs_attention"
  | "expired"
  | "error";

export type IntegrationItem = {
  id: string;
  key: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  connectedOn: string | null;
  lastSync: string | null;
  description: string;
};
