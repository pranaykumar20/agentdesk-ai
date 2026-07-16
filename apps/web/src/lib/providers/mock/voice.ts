import type { VoiceProvider, VoiceAgentInput } from "../types";

const agents = new Map<string, VoiceAgentInput>();
const calls = new Map<string, { status: string; agentId: string }>();

export const mockVoiceProvider: VoiceProvider = {
  name: "mock",

  async createAgent(input) {
    const externalAgentId = `mock_agent_${crypto.randomUUID()}`;
    agents.set(externalAgentId, input);
    return { externalAgentId };
  },

  async updateAgent(externalAgentId, input) {
    const existing = agents.get(externalAgentId);
    if (!existing) throw new Error("Mock agent not found");
    agents.set(externalAgentId, { ...existing, ...input });
  },

  async publishAgent(externalAgentId) {
    if (!agents.has(externalAgentId)) throw new Error("Mock agent not found");
  },

  async initiateTestCall(input) {
    const externalCallId = `mock_call_${crypto.randomUUID()}`;
    calls.set(externalCallId, { status: "completed", agentId: input.externalAgentId });
    return { externalCallId };
  },

  async getCall(externalCallId) {
    const call = calls.get(externalCallId);
    return { status: call?.status ?? "unknown", raw: call ?? null };
  },

  async transferCall() {
    // no-op in mock
  },

  async verifyWebhook() {
    // Never accept forged webhooks if mock is accidentally selected in production.
    return process.env.NODE_ENV !== "production";
  },
};
