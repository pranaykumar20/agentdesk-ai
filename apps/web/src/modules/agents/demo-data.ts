import type { AiAgent } from "./types";

const store = new Map<string, AiAgent[]>();

function buildAgent(
  organizationId: string,
  partial: Partial<AiAgent> & Pick<AiAgent, "id" | "name" | "roleTitle">,
): AiAgent {
  const now = new Date().toISOString();
  return {
    organizationId,
    description: partial.description ?? "AI employee for your business.",
    department: partial.department ?? "Front Office",
    language: partial.language ?? "English US",
    voice: partial.voice ?? "Ava Natural",
    timezone: partial.timezone ?? "America/New_York",
    status: partial.status ?? "active",
    lifecycleStatus: partial.lifecycleStatus ?? "published",
    avatarUrl: partial.avatarUrl ?? null,
    personality: partial.personality ?? "Friendly professional",
    performanceScore: partial.performanceScore ?? 92.6,
    tags: partial.tags ?? ["Receptionist"],
    model: partial.model ?? "GPT-4o",
    confidenceThreshold: partial.confidenceThreshold ?? 80,
    capabilities: partial.capabilities ?? [
      {
        key: "answer_faqs",
        title: "Answer general questions",
        description: "FAQs about services, hours, and policies.",
        enabled: true,
      },
      {
        key: "book_appointments",
        title: "Book and manage appointments",
        description: "Schedules, reschedules, cancels.",
        enabled: true,
      },
      {
        key: "route_human",
        title: "Route to human agent",
        description: "Transfers calls to the appropriate team.",
        enabled: true,
      },
    ],
    draft: partial.draft ?? {
      id: `ver-draft-${partial.id}`,
      versionNumber: 2,
      status: "draft",
      greeting: "Hi! Thanks for calling. How can I help you today?",
      systemPrompt: `You are ${partial.name}, a helpful AI employee.`,
      tone: "Friendly professional",
      publishedAt: null,
      updatedAt: now,
    },
    published: partial.published ?? {
      id: `ver-pub-${partial.id}`,
      versionNumber: 1,
      status: "published",
      greeting: "Hi! Thanks for calling. How can I help you today?",
      systemPrompt: `You are ${partial.name}.`,
      tone: "Friendly professional",
      publishedAt: "2024-05-18T12:00:00.000Z",
      updatedAt: "2024-05-18T12:00:00.000Z",
    },
    updatedAt: partial.updatedAt ?? now,
    id: partial.id,
    name: partial.name,
    roleTitle: partial.roleTitle,
  };
}

function defaultAgents(organizationId: string): AiAgent[] {
  return [
    buildAgent(organizationId, {
      id: "agent-ava",
      name: "Ava - Dental Receptionist",
      roleTitle: "Receptionist",
      department: "Front Office",
      description:
        "Handles calls, books appointments, answers FAQs, and routes to the right team.",
      performanceScore: 96.2,
      tags: ["Dental", "Receptionist"],
      lifecycleStatus: "published",
    }),
    buildAgent(organizationId, {
      id: "agent-noah",
      name: "Noah - Appointment Setter",
      roleTitle: "Appointment Setter",
      department: "Scheduling",
      performanceScore: 91.4,
      tags: ["Scheduling"],
      lifecycleStatus: "published",
    }),
    buildAgent(organizationId, {
      id: "agent-mia",
      name: "Mia - Billing Agent",
      roleTitle: "Billing Agent",
      department: "Billing",
      performanceScore: 88.1,
      tags: ["Billing"],
      lifecycleStatus: "draft",
      status: "inactive",
    }),
  ];
}

export function listDemoAgents(organizationId: string): AiAgent[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaultAgents(organizationId));
  }
  return store.get(organizationId)!;
}

export function getDemoAgent(organizationId: string): AiAgent {
  const agents = listDemoAgents(organizationId);
  return agents[0]!;
}

export function getDemoAgentById(organizationId: string, id: string): AiAgent | null {
  return listDemoAgents(organizationId).find((a) => a.id === id) ?? null;
}

export function setDemoAgent(organizationId: string, agent: AiAgent): void {
  const agents = listDemoAgents(organizationId);
  const idx = agents.findIndex((a) => a.id === agent.id);
  if (idx >= 0) agents[idx] = agent;
  else agents.unshift(agent);
  store.set(organizationId, agents);
}

export function addDemoAgent(organizationId: string, agent: AiAgent): AiAgent {
  const agents = listDemoAgents(organizationId);
  agents.unshift(agent);
  store.set(organizationId, agents);
  return agent;
}
