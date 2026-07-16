export type AgentVersionStatus = "draft" | "published" | "archived";

export type AgentCapability = {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
};

export type AgentVersion = {
  id: string;
  versionNumber: number;
  status: AgentVersionStatus;
  greeting: string;
  systemPrompt: string;
  tone: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type AiAgent = {
  id: string;
  organizationId: string;
  name: string;
  roleTitle: string;
  description: string;
  language: string;
  voice: string;
  timezone: string;
  status: "active" | "inactive";
  model: string;
  confidenceThreshold: number;
  capabilities: AgentCapability[];
  draft: AgentVersion;
  published: AgentVersion | null;
};
