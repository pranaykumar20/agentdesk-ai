export type AgentVersionStatus = "draft" | "published" | "archived";
export type EmployeeLifecycleStatus = "draft" | "published" | "archived";

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
  department: string;
  language: string;
  voice: string;
  timezone: string;
  /** Legacy runtime flag */
  status: "active" | "inactive";
  lifecycleStatus: EmployeeLifecycleStatus;
  avatarUrl: string | null;
  personality: string;
  performanceScore: number | null;
  tags: string[];
  model: string;
  confidenceThreshold: number;
  capabilities: AgentCapability[];
  draft: AgentVersion;
  published: AgentVersion | null;
  updatedAt: string;
};

export type AiEmployeeSummary = {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  lifecycleStatus: EmployeeLifecycleStatus;
  language: string;
  voice: string;
  performanceScore: number | null;
  publishedVersion: number | null;
  updatedAt: string;
};
