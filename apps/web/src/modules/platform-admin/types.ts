export type PlatformTenant = {
  id: string;
  name: string;
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  seats: number;
  usageMinutes: number;
  createdAt: string;
};

export type PlatformHealth = {
  api: "healthy" | "degraded";
  webhooks: "healthy" | "degraded";
  voice: "healthy" | "degraded";
  database: "healthy" | "degraded";
};

export type PlatformFlagRow = {
  key: string;
  description: string;
  defaultEnabled: boolean;
};
