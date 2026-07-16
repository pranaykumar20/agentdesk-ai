import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  addDemoDocument,
  buildDemoFaqs,
  getDemoDocuments,
} from "./demo-data";
import type { FaqItem, KnowledgeDocument, KnowledgeMetrics, KnowledgeStatus } from "./types";

export async function listKnowledgeDocuments(organizationId: string): Promise<KnowledgeDocument[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("*")
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          organizationId: row.organization_id,
          title: row.title,
          status: row.status as KnowledgeStatus,
          category: row.category,
          mimeType: row.mime_type,
          byteSize: row.byte_size,
          viewCount: row.view_count,
          helpfulRate: row.helpful_rate,
          updatedAt: row.updated_at,
        }));
      }
    } catch {
      // demo
    }
  }
  return getDemoDocuments(organizationId);
}

export async function listFaqs(organizationId: string): Promise<FaqItem[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          organizationId: row.organization_id,
          question: row.question,
          answer: row.answer,
          category: row.category,
          status: row.status as KnowledgeStatus,
        }));
      }
    } catch {
      // demo
    }
  }
  return buildDemoFaqs(organizationId);
}

export async function getKnowledgeMetrics(organizationId: string): Promise<KnowledgeMetrics> {
  const docs = await listKnowledgeDocuments(organizationId);
  return {
    totalArticles: docs.length,
    published: docs.filter((d) => d.status === "published").length,
    drafts: docs.filter((d) => d.status === "draft").length,
    processing: docs.filter((d) => d.status === "processing").length,
    failed: docs.filter((d) => d.status === "failed").length,
  };
}

export async function createKnowledgeDocument(input: {
  organizationId: string;
  title: string;
  category?: string;
  mimeType?: string;
  byteSize?: number;
}): Promise<KnowledgeDocument> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_documents")
        .insert({
          organization_id: input.organizationId,
          title: input.title,
          category: input.category ?? "General",
          mime_type: input.mimeType ?? "text/plain",
          byte_size: input.byteSize ?? 0,
          status: "processing",
        })
        .select("*")
        .single();

      if (!error && data) {
        return {
          id: data.id,
          organizationId: data.organization_id,
          title: data.title,
          status: data.status as KnowledgeStatus,
          category: data.category,
          mimeType: data.mime_type,
          byteSize: data.byte_size,
          viewCount: data.view_count,
          helpfulRate: data.helpful_rate,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // demo
    }
  }

  const doc: KnowledgeDocument = {
    id: `demo-doc-${crypto.randomUUID().slice(0, 8)}`,
    organizationId: input.organizationId,
    title: input.title,
    status: "processing",
    category: input.category ?? "General",
    mimeType: input.mimeType ?? "text/plain",
    byteSize: input.byteSize ?? 0,
    viewCount: 0,
    helpfulRate: null,
    updatedAt: new Date().toISOString(),
  };
  addDemoDocument(doc);

  // Mock processing: flip to published after create (next read still shows processing until refresh with updated store)
  setTimeout(() => {
    doc.status = "published";
    doc.updatedAt = new Date().toISOString();
  }, 0);

  return doc;
}
