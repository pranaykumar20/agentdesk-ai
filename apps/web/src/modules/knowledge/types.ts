export type KnowledgeStatus = "draft" | "processing" | "published" | "failed" | "archived";

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
};

export type FaqItem = {
  id: string;
  organizationId: string;
  question: string;
  answer: string;
  category: string | null;
  status: KnowledgeStatus;
};

export type KnowledgeMetrics = {
  totalArticles: number;
  published: number;
  drafts: number;
  processing: number;
  failed: number;
};
