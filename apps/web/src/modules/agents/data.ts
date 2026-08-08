import { getVoiceProvider } from "@/lib/providers";
import { shouldUseDemoData } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import {
  addDemoAgent,
  getDemoAgent,
  getDemoAgentById,
  listDemoAgents,
  setDemoAgent,
} from "./demo-data";
import type { AiAgent, AiEmployeeSummary, AgentCapability, EmployeeLifecycleStatus } from "./types";

type Behavior = {
  retellLlmId?: string;
  tone?: string;
  personality?: string;
  department?: string;
  capabilities?: AgentCapability[];
  tags?: string[];
};

function toSummary(agent: AiAgent): AiEmployeeSummary {
  return {
    id: agent.id,
    name: agent.name,
    roleTitle: agent.roleTitle,
    department: agent.department,
    lifecycleStatus: agent.lifecycleStatus,
    language: agent.language,
    voice: agent.voice,
    description: agent.description,
    personality: agent.personality,
    tags: agent.tags,
    capabilities: agent.capabilities.filter((c) => c.enabled).map((c) => c.title),
    performanceScore: agent.performanceScore,
    publishedVersion: agent.published?.versionNumber ?? null,
    updatedAt: agent.updatedAt,
  };
}

function behaviorOf(value: Json | null | undefined): Behavior {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Behavior;
}

function mapRowToAgent(
  row: {
    id: string;
    organization_id: string;
    name: string;
    role_title: string | null;
    description: string | null;
    status: string;
    primary_language: string;
    voice: string | null;
    timezone: string | null;
    lifecycle_status: string;
    department: string | null;
    external_provider: string | null;
    external_agent_id: string | null;
    updated_at: string;
  },
  draft: {
    id: string;
    version_number: number;
    status: string;
    greeting: string | null;
    system_prompt: string | null;
    behavior: Json;
    published_at: string | null;
    updated_at: string;
  } | null,
  published: {
    id: string;
    version_number: number;
    status: string;
    greeting: string | null;
    system_prompt: string | null;
    behavior: Json;
    published_at: string | null;
    updated_at: string;
  } | null,
): AiAgent {
  const draftBehavior = behaviorOf(draft?.behavior);
  const publishedBehavior = behaviorOf(published?.behavior);
  const behavior = { ...publishedBehavior, ...draftBehavior };
  const now = row.updated_at;
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    roleTitle: row.role_title ?? "Receptionist",
    description: row.description ?? "",
    department: row.department ?? behavior.department ?? "General",
    language: row.primary_language || "en-US",
    voice: row.voice ?? "11labs-Adrian",
    timezone: row.timezone ?? "America/New_York",
    status: row.status === "active" ? "active" : "inactive",
    lifecycleStatus: (row.lifecycle_status as EmployeeLifecycleStatus) || "draft",
    avatarUrl: null,
    personality: behavior.personality ?? "Friendly professional",
    performanceScore: null,
    tags: behavior.tags ?? [],
    model: "retell-llm",
    confidenceThreshold: 80,
    capabilities: behavior.capabilities ?? [],
    draft: {
      id: draft?.id ?? `draft-${row.id}`,
      versionNumber: draft?.version_number ?? 1,
      status: (draft?.status as "draft" | "published" | "archived") ?? "draft",
      greeting: draft?.greeting ?? "Hi! Thanks for calling. How can I help?",
      systemPrompt: draft?.system_prompt ?? `You are ${row.name}, a helpful AI receptionist.`,
      tone: behavior.tone ?? "Friendly professional",
      publishedAt: draft?.published_at ?? null,
      updatedAt: draft?.updated_at ?? now,
    },
    published: published
      ? {
          id: published.id,
          versionNumber: published.version_number,
          status: "published",
          greeting: published.greeting ?? "",
          systemPrompt: published.system_prompt ?? "",
          tone: publishedBehavior.tone ?? "Friendly professional",
          publishedAt: published.published_at,
          updatedAt: published.updated_at,
        }
      : null,
    externalAgentId: row.external_agent_id,
    externalProvider: row.external_provider,
    externalLlmId: behavior.retellLlmId ?? null,
    updatedAt: row.updated_at,
  };
}

async function loadAgentFromDb(organizationId: string, id: string): Promise<AiAgent | null> {
  if (!getSupabaseEnv().configured) return null;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();
  if (error || !row) return null;

  const { data: versions } = await supabase
    .from("ai_agent_versions")
    .select("*")
    .eq("agent_id", id)
    .order("version_number", { ascending: false });

  const draft =
    versions?.find((v) => v.status === "draft") ?? versions?.[0] ?? null;
  const published = versions?.find((v) => v.status === "published") ?? null;
  return mapRowToAgent(row, draft, published);
}

async function listAgentsFromDb(organizationId: string): Promise<AiAgent[] | null> {
  if (!getSupabaseEnv().configured) return null;
  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });
    if (error) return null;
    if (!rows) return [];

    const results: AiAgent[] = [];
    for (const row of rows) {
      const agent = await loadAgentFromDb(organizationId, row.id);
      if (agent) results.push(agent);
    }
    return results;
  } catch {
    return null;
  }
}

export async function listAiEmployees(organizationId: string): Promise<AiEmployeeSummary[]> {
  const fromDb = await listAgentsFromDb(organizationId);
  if (fromDb) return fromDb.map(toSummary);
  if (shouldUseDemoData()) return listDemoAgents(organizationId).map(toSummary);
  return [];
}

export async function countAiEmployees(organizationId: string): Promise<number> {
  return (await listAiEmployees(organizationId)).length;
}

export async function getAiEmployeeMetrics(organizationId: string) {
  const items = await listAiEmployees(organizationId);
  const published = items.filter((i) => i.lifecycleStatus === "published").length;
  const draft = items.filter((i) => i.lifecycleStatus === "draft").length;
  const archived = items.filter((i) => i.lifecycleStatus === "archived").length;
  const avgScore =
    items.reduce((sum, i) => sum + (i.performanceScore ?? 0), 0) / Math.max(items.length, 1);
  return {
    total: items.length,
    published,
    draft,
    archived,
    avgAccuracy: Number(avgScore.toFixed(1)),
  };
}

export async function getAiAgent(organizationId: string): Promise<AiAgent> {
  const items = await listAgentsFromDb(organizationId);
  if (items && items.length > 0) return items[0]!;
  if (shouldUseDemoData()) return getDemoAgent(organizationId);
  throw new Error("No AI employee found");
}

export async function getAiEmployeeById(
  organizationId: string,
  id: string,
): Promise<AiAgent | null> {
  const fromDb = await loadAgentFromDb(organizationId, id);
  if (fromDb) return fromDb;
  if (shouldUseDemoData()) return getDemoAgentById(organizationId, id);
  return null;
}

export async function getPublishedAgentForOrg(organizationId: string): Promise<AiAgent | null> {
  const items = (await listAgentsFromDb(organizationId)) ?? [];
  const published = items.find((a) => a.lifecycleStatus === "published" && a.externalAgentId);
  if (published) return published;
  if (shouldUseDemoData()) {
    const demo = listDemoAgents(organizationId).find((a) => a.lifecycleStatus === "published");
    return demo ?? null;
  }
  return null;
}

export async function createAiEmployee(
  organizationId: string,
  input: {
    name: string;
    roleTitle: string;
    description?: string;
    department?: string;
    language?: string;
    voice?: string;
    greeting?: string;
    systemPrompt?: string;
  },
): Promise<AiAgent> {
  const now = new Date().toISOString();
  const greeting =
    input.greeting ?? `Hi! Thanks for calling. I'm ${input.name}. How can I help?`;
  const systemPrompt =
    input.systemPrompt ??
    `You are ${input.name}, a ${input.roleTitle}. Answer questions, capture caller details, and book appointments when asked.`;

  const voice = getVoiceProvider();
  const created = await voice.createAgent({
    organizationId,
    name: input.name,
    greeting,
    systemPrompt,
    voice: input.voice,
    language: input.language ?? "en-US",
  });

  if (!getSupabaseEnv().configured) {
    if (!shouldUseDemoData()) {
      throw new Error("Supabase is required to create AI employees outside demo mode");
    }
    const id = `agent-${crypto.randomUUID().slice(0, 8)}`;
    const agent: AiAgent = {
      id,
      organizationId,
      name: input.name,
      roleTitle: input.roleTitle,
      description: input.description ?? "",
      department: input.department ?? "General",
      language: input.language ?? "en-US",
      voice: input.voice ?? "11labs-Adrian",
      timezone: "America/New_York",
      status: "inactive",
      lifecycleStatus: "draft",
      avatarUrl: null,
      personality: "Friendly professional",
      performanceScore: null,
      tags: [],
      model: "retell-llm",
      confidenceThreshold: 80,
      capabilities: [],
      draft: {
        id: `ver-draft-${id}`,
        versionNumber: 1,
        status: "draft",
        greeting,
        systemPrompt,
        tone: "Friendly professional",
        publishedAt: null,
        updatedAt: now,
      },
      published: null,
      externalAgentId: created.externalAgentId,
      externalProvider: voice.name,
      externalLlmId: created.externalLlmId ?? null,
      updatedAt: now,
    };
    return addDemoAgent(organizationId, agent);
  }

  const supabase = await createClient();
  const behavior: Behavior = {
    retellLlmId: created.externalLlmId,
    tone: "Friendly professional",
    personality: "Friendly professional",
    department: input.department ?? "General",
    capabilities: [],
    tags: [],
  };

  const { data: row, error } = await supabase
    .from("ai_agents")
    .insert({
      organization_id: organizationId,
      name: input.name,
      role_title: input.roleTitle,
      description: input.description ?? null,
      status: "inactive",
      lifecycle_status: "draft",
      primary_language: input.language ?? "en-US",
      voice: input.voice ?? "11labs-Adrian",
      timezone: "America/New_York",
      department: input.department ?? "General",
      external_provider: voice.name,
      external_agent_id: created.externalAgentId,
    })
    .select("*")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Failed to create AI employee");
  }

  const { data: version, error: versionError } = await supabase
    .from("ai_agent_versions")
    .insert({
      organization_id: organizationId,
      agent_id: row.id,
      version_number: 1,
      status: "draft",
      greeting,
      system_prompt: systemPrompt,
      behavior: behavior as Json,
    })
    .select("*")
    .single();

  if (versionError || !version) {
    throw new Error(versionError?.message ?? "Failed to create agent version");
  }

  return mapRowToAgent(row, version, null);
}

export async function updateAgentDraft(
  organizationId: string,
  patch: {
    id?: string;
    name?: string;
    roleTitle?: string;
    description?: string;
    greeting?: string;
    systemPrompt?: string;
    tone?: string;
    voice?: string;
    language?: string;
    department?: string;
    capabilities?: AgentCapability[];
    lifecycleStatus?: EmployeeLifecycleStatus;
  },
): Promise<AiAgent> {
  const agent = patch.id
    ? ((await getAiEmployeeById(organizationId, patch.id)) ?? (await getAiAgent(organizationId)))
    : await getAiAgent(organizationId);

  const nextGreeting = patch.greeting ?? agent.draft.greeting;
  const nextPrompt = patch.systemPrompt ?? agent.draft.systemPrompt;
  const nextName = patch.name ?? agent.name;
  const nextVoice = patch.voice ?? agent.voice;
  const nextLanguage = patch.language ?? agent.language;

  if (agent.externalAgentId) {
    const voice = getVoiceProvider();
    await voice.updateAgent(agent.externalAgentId, {
      name: nextName,
      voice: nextVoice,
      language: nextLanguage,
      greeting: nextGreeting,
      systemPrompt: nextPrompt,
      externalLlmId: agent.externalLlmId ?? undefined,
      organizationId,
    });
  }

  if (!getSupabaseEnv().configured) {
    const next: AiAgent = {
      ...agent,
      name: nextName,
      roleTitle: patch.roleTitle ?? agent.roleTitle,
      description: patch.description ?? agent.description,
      voice: nextVoice,
      language: nextLanguage,
      department: patch.department ?? agent.department,
      lifecycleStatus: patch.lifecycleStatus ?? agent.lifecycleStatus,
      capabilities: patch.capabilities ?? agent.capabilities,
      updatedAt: new Date().toISOString(),
      draft: {
        ...agent.draft,
        greeting: nextGreeting,
        systemPrompt: nextPrompt,
        tone: patch.tone ?? agent.draft.tone,
        updatedAt: new Date().toISOString(),
        status: "draft",
      },
    };
    setDemoAgent(organizationId, next);
    return next;
  }

  const supabase = await createClient();
  await supabase
    .from("ai_agents")
    .update({
      name: nextName,
      role_title: patch.roleTitle ?? agent.roleTitle,
      description: patch.description ?? agent.description,
      voice: nextVoice,
      primary_language: nextLanguage,
      department: patch.department ?? agent.department,
      lifecycle_status: patch.lifecycleStatus ?? agent.lifecycleStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", agent.id)
    .eq("organization_id", organizationId);

  const behavior: Behavior = {
    retellLlmId: agent.externalLlmId ?? undefined,
    tone: patch.tone ?? agent.draft.tone,
    personality: agent.personality,
    department: patch.department ?? agent.department,
    capabilities: patch.capabilities ?? agent.capabilities,
    tags: agent.tags,
  };

  await supabase
    .from("ai_agent_versions")
    .update({
      greeting: nextGreeting,
      system_prompt: nextPrompt,
      behavior: behavior as Json,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", agent.draft.id)
    .eq("organization_id", organizationId);

  const reloaded = await loadAgentFromDb(organizationId, agent.id);
  if (!reloaded) throw new Error("Failed to reload AI employee");
  return reloaded;
}

/** Publish draft → new published version. Syncs Retell using stored external ids. */
export async function publishAgent(organizationId: string, id?: string): Promise<AiAgent> {
  const agent = id
    ? ((await getAiEmployeeById(organizationId, id)) ?? (await getAiAgent(organizationId)))
    : await getAiAgent(organizationId);

  if (!agent.externalAgentId) {
    throw new Error("AI employee has no external agent id — recreate or sync with voice provider");
  }

  const voice = getVoiceProvider();
  await voice.updateAgent(agent.externalAgentId, {
    name: agent.name,
    voice: agent.voice,
    language: agent.language,
    greeting: agent.draft.greeting,
    systemPrompt: agent.draft.systemPrompt,
    externalLlmId: agent.externalLlmId ?? undefined,
    organizationId,
  });
  await voice.publishAgent(agent.externalAgentId);

  if (!getSupabaseEnv().configured) {
    const publishedVersion = {
      ...agent.draft,
      id: `ver-${crypto.randomUUID().slice(0, 8)}`,
      versionNumber: (agent.published?.versionNumber ?? 0) + 1,
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next: AiAgent = {
      ...agent,
      status: "active",
      lifecycleStatus: "published",
      published: publishedVersion,
      updatedAt: new Date().toISOString(),
      draft: {
        ...agent.draft,
        versionNumber: publishedVersion.versionNumber + 1,
        status: "draft",
        updatedAt: new Date().toISOString(),
      },
    };
    setDemoAgent(organizationId, next);
    return next;
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const behavior: Behavior = {
    retellLlmId: agent.externalLlmId ?? undefined,
    tone: agent.draft.tone,
    personality: agent.personality,
    department: agent.department,
    capabilities: agent.capabilities,
    tags: agent.tags,
  };

  // Promote current draft → published, then open a new draft version.
  const { data: published, error } = await supabase
    .from("ai_agent_versions")
    .update({
      status: "published",
      greeting: agent.draft.greeting,
      system_prompt: agent.draft.systemPrompt,
      behavior: behavior as Json,
      published_at: now,
      updated_at: now,
    })
    .eq("id", agent.draft.id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error || !published) {
    throw new Error(error?.message ?? "Failed to publish agent version");
  }

  const { error: draftError } = await supabase.from("ai_agent_versions").insert({
    organization_id: organizationId,
    agent_id: agent.id,
    version_number: published.version_number + 1,
    status: "draft",
    greeting: agent.draft.greeting,
    system_prompt: agent.draft.systemPrompt,
    behavior: behavior as Json,
  });

  if (draftError) {
    throw new Error(draftError.message ?? "Failed to create next draft version");
  }

  await supabase
    .from("ai_agents")
    .update({
      status: "active",
      lifecycle_status: "published",
      published_version_id: published.id,
      updated_at: now,
    })
    .eq("id", agent.id)
    .eq("organization_id", organizationId);

  const reloaded = await loadAgentFromDb(organizationId, agent.id);
  if (!reloaded) throw new Error("Failed to reload published AI employee");
  return reloaded;
}

export async function cloneAiEmployee(organizationId: string, id: string): Promise<AiAgent | null> {
  const source = await getAiEmployeeById(organizationId, id);
  if (!source) return null;
  return createAiEmployee(organizationId, {
    name: `${source.name} (Copy)`,
    roleTitle: source.roleTitle,
    description: source.description,
    department: source.department,
    language: source.language,
    voice: source.voice,
    greeting: source.draft.greeting,
    systemPrompt: source.draft.systemPrompt,
  });
}
