import { shouldUseDemoData } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  addDemoDocument,
  addDemoFaq,
  buildDemoFaqs,
  getDemoDocuments,
  getDemoFaqs,
} from "./demo-data";
import type {
  FaqItem,
  KnowledgeAgentFilter,
  KnowledgeDocument,
  KnowledgeMetrics,
  KnowledgeStatus,
} from "./types";

type AgentJoin = { id: string; name: string } | null;

function mapDocument(
  row: {
    id: string;
    organization_id: string;
    title: string;
    status: string;
    category: string | null;
    mime_type: string | null;
    byte_size: number | null;
    view_count: number;
    helpful_rate: number | null;
    updated_at: string;
    agent_id?: string | null;
    ai_agents?: AgentJoin | AgentJoin[];
  },
): KnowledgeDocument {
  const agent = Array.isArray(row.ai_agents) ? row.ai_agents[0] : row.ai_agents;
  return {
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
    agentId: row.agent_id ?? null,
    agentName: agent?.name ?? null,
  };
}

function mapFaq(
  row: {
    id: string;
    organization_id: string;
    question: string;
    answer: string;
    category: string | null;
    status: string;
    agent_id?: string | null;
    ai_agents?: AgentJoin | AgentJoin[];
  },
): FaqItem {
  const agent = Array.isArray(row.ai_agents) ? row.ai_agents[0] : row.ai_agents;
  return {
    id: row.id,
    organizationId: row.organization_id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    status: row.status as KnowledgeStatus,
    agentId: row.agent_id ?? null,
    agentName: agent?.name ?? null,
  };
}

function applyAgentFilter<T extends { agentId: string | null }>(
  items: T[],
  filter?: KnowledgeAgentFilter,
): T[] {
  if (!filter || filter === "all") return items;
  if (filter === "shared") return items.filter((i) => i.agentId == null);
  return items.filter((i) => i.agentId == null || i.agentId === filter);
}

async function assertAgentInOrg(
  organizationId: string,
  agentId: string | null | undefined,
): Promise<string | null> {
  if (!agentId) return null;
  if (!getSupabaseEnv().configured) return agentId;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_agents")
    .select("id")
    .eq("id", agentId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("Selected AI employee was not found in this organization");
  }
  return data.id;
}

export async function listKnowledgeDocuments(
  organizationId: string,
  options?: { agentFilter?: KnowledgeAgentFilter },
): Promise<KnowledgeDocument[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("knowledge_documents")
        .select("*, ai_agents(id, name)")
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      const filter = options?.agentFilter;
      if (filter === "shared") {
        query = query.is("agent_id", null);
      } else if (filter && filter !== "all") {
        // Agent view = shared + assigned to that agent (what the live prompt uses).
        query = query.or(`agent_id.is.null,agent_id.eq.${filter}`);
      }

      const { data, error } = await query;

      if (!error && data) {
        if (data.length > 0 || !shouldUseDemoData()) {
          return data.map((row) => mapDocument(row as Parameters<typeof mapDocument>[0]));
        }
      }
    } catch {
      // demo
    }
  }
  if (!shouldUseDemoData()) return [];
  return applyAgentFilter(getDemoDocuments(organizationId), options?.agentFilter);
}

export async function listFaqs(
  organizationId: string,
  options?: { agentFilter?: KnowledgeAgentFilter },
): Promise<FaqItem[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("faq_items")
        .select("*, ai_agents(id, name)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      const filter = options?.agentFilter;
      if (filter === "shared") {
        query = query.is("agent_id", null);
      } else if (filter && filter !== "all") {
        query = query.or(`agent_id.is.null,agent_id.eq.${filter}`);
      }

      const { data, error } = await query;

      if (!error && data) {
        if (data.length > 0 || !shouldUseDemoData()) {
          return data.map((row) => mapFaq(row as Parameters<typeof mapFaq>[0]));
        }
      }
    } catch {
      // demo
    }
  }
  if (!shouldUseDemoData()) return [];
  return applyAgentFilter(getDemoFaqs(organizationId), options?.agentFilter);
}

/** Shared (null) + agent-specific published knowledge for live prompt sync. */
export async function listKnowledgeForAgent(
  organizationId: string,
  agentId: string,
): Promise<{ faqs: FaqItem[]; documents: KnowledgeDocument[] }> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const [faqRes, docRes] = await Promise.all([
        supabase
          .from("faq_items")
          .select("*, ai_agents(id, name)")
          .eq("organization_id", organizationId)
          .or(`agent_id.is.null,agent_id.eq.${agentId}`)
          .order("created_at", { ascending: false }),
        supabase
          .from("knowledge_documents")
          .select("*, ai_agents(id, name)")
          .eq("organization_id", organizationId)
          .or(`agent_id.is.null,agent_id.eq.${agentId}`)
          .order("updated_at", { ascending: false }),
      ]);

      if (!faqRes.error && !docRes.error) {
        return {
          faqs: (faqRes.data ?? []).map((row) => mapFaq(row as Parameters<typeof mapFaq>[0])),
          documents: (docRes.data ?? []).map((row) =>
            mapDocument(row as Parameters<typeof mapDocument>[0]),
          ),
        };
      }
    } catch {
      // demo
    }
  }

  if (!shouldUseDemoData()) return { faqs: [], documents: [] };
  const faqs = getDemoFaqs(organizationId).filter(
    (f) => f.agentId == null || f.agentId === agentId,
  );
  const documents = getDemoDocuments(organizationId).filter(
    (d) => d.agentId == null || d.agentId === agentId,
  );
  return { faqs, documents };
}

export async function getKnowledgeMetrics(
  organizationId: string,
  options?: { agentFilter?: KnowledgeAgentFilter },
): Promise<KnowledgeMetrics> {
  const docs = await listKnowledgeDocuments(organizationId, options);
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
  agentId?: string | null;
}): Promise<KnowledgeDocument> {
  const agentId = await assertAgentInOrg(input.organizationId, input.agentId);

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
          agent_id: agentId,
        })
        .select("*, ai_agents(id, name)")
        .single();

      if (!error && data) {
        return mapDocument(data as Parameters<typeof mapDocument>[0]);
      }
      if (error) throw new Error(error.message);
    } catch (err) {
      if (!shouldUseDemoData()) throw err;
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
    agentId,
    agentName: null,
  };
  addDemoDocument(doc);

  setTimeout(() => {
    doc.status = "published";
    doc.updatedAt = new Date().toISOString();
  }, 0);

  return doc;
}

export async function createFaq(input: {
  organizationId: string;
  question: string;
  answer: string;
  category?: string;
  agentId?: string | null;
}): Promise<FaqItem> {
  const agentId = await assertAgentInOrg(input.organizationId, input.agentId);

  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("faq_items")
        .insert({
          organization_id: input.organizationId,
          question: input.question,
          answer: input.answer,
          category: input.category ?? "General",
          status: "published",
          agent_id: agentId,
        })
        .select("*, ai_agents(id, name)")
        .single();

      if (!error && data) {
        return mapFaq(data as Parameters<typeof mapFaq>[0]);
      }
      if (error) throw new Error(error.message);
    } catch (err) {
      if (!shouldUseDemoData()) throw err;
    }
  }

  if (!shouldUseDemoData()) {
    throw new Error("Supabase is required to create FAQs outside demo mode");
  }

  const faq: FaqItem = {
    id: `demo-faq-${crypto.randomUUID().slice(0, 8)}`,
    organizationId: input.organizationId,
    question: input.question,
    answer: input.answer,
    category: input.category ?? "General",
    status: "published",
    agentId,
    agentName: null,
  };
  addDemoFaq(faq);
  return faq;
}
