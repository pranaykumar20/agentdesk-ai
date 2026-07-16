import type { AiAgent } from "./types";

const store = new Map<string, AiAgent>();

function defaultAgent(organizationId: string): AiAgent {
  const now = new Date().toISOString();
  return {
    id: "agent-ava",
    organizationId,
    name: "Smile Assistant",
    roleTitle: "Dental Receptionist",
    description:
      "AI assistant for Smile Dental Care. Handles calls, books appointments, answers FAQs, and routes to the right team.",
    language: "English US",
    voice: "Ava Natural",
    timezone: "America/New_York",
    status: "active",
    model: "GPT-4o",
    confidenceThreshold: 80,
    capabilities: [
      {
        key: "answer_faqs",
        title: "Answer general questions",
        description: "FAQs about services, insurance, hours.",
        enabled: true,
      },
      {
        key: "book_appointments",
        title: "Book and manage appointments",
        description: "Schedules, reschedules, cancels.",
        enabled: true,
      },
      {
        key: "verify_insurance",
        title: "Verify insurance eligibility",
        description: "Checks coverage and answers billing questions.",
        enabled: true,
      },
      {
        key: "route_human",
        title: "Route to human agent",
        description: "Transfers calls to the appropriate team.",
        enabled: true,
      },
      {
        key: "collect_leads",
        title: "Collect lead information",
        description: "Captures caller details and adds to CRM.",
        enabled: true,
      },
    ],
    draft: {
      id: "ver-draft",
      versionNumber: 2,
      status: "draft",
      greeting: "Hi! Thanks for calling Smile Dental Care. How can I help you today?",
      systemPrompt:
        "You are Ava, a friendly dental receptionist. Be concise, warm, and confirm details before booking.",
      tone: "Friendly professional",
      publishedAt: null,
      updatedAt: now,
    },
    published: {
      id: "ver-pub",
      versionNumber: 1,
      status: "published",
      greeting: "Hi! Thanks for calling Smile Dental Care. How can I help you today?",
      systemPrompt: "You are Ava, a friendly dental receptionist for Smile Dental Care.",
      tone: "Friendly professional",
      publishedAt: "2024-05-18T12:00:00.000Z",
      updatedAt: "2024-05-18T12:00:00.000Z",
    },
  };
}

export function getDemoAgent(organizationId: string): AiAgent {
  return store.get(organizationId) ?? defaultAgent(organizationId);
}

export function setDemoAgent(organizationId: string, agent: AiAgent): void {
  store.set(organizationId, agent);
}
