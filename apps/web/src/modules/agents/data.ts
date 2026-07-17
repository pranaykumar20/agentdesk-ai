import { getVoiceProvider } from "@/lib/providers";
import {
  addDemoAgent,
  getDemoAgent,
  getDemoAgentById,
  listDemoAgents,
  setDemoAgent,
} from "./demo-data";
import type { AiAgent, AiEmployeeSummary, AgentCapability, EmployeeLifecycleStatus } from "./types";

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

export async function listAiEmployees(organizationId: string): Promise<AiEmployeeSummary[]> {
  return listDemoAgents(organizationId).map(toSummary);
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
  return getDemoAgent(organizationId);
}

export async function getAiEmployeeById(
  organizationId: string,
  id: string,
): Promise<AiAgent | null> {
  return getDemoAgentById(organizationId, id);
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
  },
): Promise<AiAgent> {
  const now = new Date().toISOString();
  const id = `agent-${crypto.randomUUID().slice(0, 8)}`;
  const agent: AiAgent = {
    id,
    organizationId,
    name: input.name,
    roleTitle: input.roleTitle,
    description: input.description ?? "",
    department: input.department ?? "General",
    language: input.language ?? "English US",
    voice: input.voice ?? "Ava Natural",
    timezone: "America/New_York",
    status: "inactive",
    lifecycleStatus: "draft",
    avatarUrl: null,
    personality: "Friendly professional",
    performanceScore: null,
    tags: [],
    model: "GPT-4o",
    confidenceThreshold: 80,
    capabilities: [],
    draft: {
      id: `ver-draft-${id}`,
      versionNumber: 1,
      status: "draft",
      greeting: `Hi! Thanks for calling. I'm ${input.name}. How can I help?`,
      systemPrompt: `You are ${input.name}, a ${input.roleTitle}.`,
      tone: "Friendly professional",
      publishedAt: null,
      updatedAt: now,
    },
    published: null,
    updatedAt: now,
  };
  return addDemoAgent(organizationId, agent);
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

  const next: AiAgent = {
    ...agent,
    name: patch.name ?? agent.name,
    roleTitle: patch.roleTitle ?? agent.roleTitle,
    description: patch.description ?? agent.description,
    voice: patch.voice ?? agent.voice,
    language: patch.language ?? agent.language,
    department: patch.department ?? agent.department,
    lifecycleStatus: patch.lifecycleStatus ?? agent.lifecycleStatus,
    capabilities: patch.capabilities ?? agent.capabilities,
    updatedAt: new Date().toISOString(),
    draft: {
      ...agent.draft,
      greeting: patch.greeting ?? agent.draft.greeting,
      systemPrompt: patch.systemPrompt ?? agent.draft.systemPrompt,
      tone: patch.tone ?? agent.draft.tone,
      updatedAt: new Date().toISOString(),
      status: "draft",
    },
  };
  setDemoAgent(organizationId, next);
  return next;
}

/** Publish draft → new published version. Does not silently mutate live config without this call. */
export async function publishAgent(organizationId: string, id?: string): Promise<AiAgent> {
  const agent = id
    ? ((await getAiEmployeeById(organizationId, id)) ?? (await getAiAgent(organizationId)))
    : await getAiAgent(organizationId);
  const voice = getVoiceProvider();

  try {
    await voice.publishAgent(agent.id);
  } catch {
    // mock/retell stub may throw — publishing still updates local draft/publish state
  }

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
  });
}
