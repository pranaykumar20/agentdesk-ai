import { getVoiceProvider } from "@/lib/providers";
import { getDemoAgent, setDemoAgent } from "./demo-data";
import type { AiAgent, AgentCapability } from "./types";

export async function getAiAgent(organizationId: string): Promise<AiAgent> {
  return getDemoAgent(organizationId);
}

export async function updateAgentDraft(
  organizationId: string,
  patch: {
    name?: string;
    roleTitle?: string;
    description?: string;
    greeting?: string;
    systemPrompt?: string;
    tone?: string;
    voice?: string;
    language?: string;
    capabilities?: AgentCapability[];
  },
): Promise<AiAgent> {
  const agent = await getAiAgent(organizationId);
  const next: AiAgent = {
    ...agent,
    name: patch.name ?? agent.name,
    roleTitle: patch.roleTitle ?? agent.roleTitle,
    description: patch.description ?? agent.description,
    voice: patch.voice ?? agent.voice,
    language: patch.language ?? agent.language,
    capabilities: patch.capabilities ?? agent.capabilities,
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
export async function publishAgent(organizationId: string): Promise<AiAgent> {
  const agent = await getAiAgent(organizationId);
  const voice = getVoiceProvider();

  // Ensure provider has an agent representation (mock no-ops if already created)
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
    published: publishedVersion,
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
