export type KnowledgeStatus = "draft" | "processing" | "published" | "failed" | "archived";

/** Filter for KB lists: all rows, shared only (null agent), or one agent. */
export type KnowledgeAgentFilter = "all" | "shared" | string;

export type KnowledgeDocument = {
  id: string;
  organizationId: string;
  title: string;
  status: KnowledgeStatus;
  category: string | null;
  mimeType: string | null;
  byteSize: number | null;
  viewCount: number;
  helpfulRate: number | null;
  updatedAt: string;
  /** null = available to all agents in the org */
  agentId: string | null;
  agentName?: string | null;
  /** Extracted chunk text (or article summary) for prompt injection */
  contentExcerpt?: string | null;
};

export type FaqItem = {
  id: string;
  organizationId: string;
  question: string;
  answer: string;
  category: string | null;
  status: KnowledgeStatus;
  /** null = available to all agents in the org */
  agentId: string | null;
  agentName?: string | null;
};

export type KnowledgeMetrics = {
  totalArticles: number;
  published: number;
  drafts: number;
  processing: number;
  failed: number;
};
