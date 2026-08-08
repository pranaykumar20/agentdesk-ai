import type { VoiceProvider } from "../types";

const agents = new Map<string, { name: string; llmId: string }>();
const calls = new Map<string, { status: string }>();

export const mockVoiceProvider: VoiceProvider = {
  name: "mock",

  async createAgent(input) {
    const externalAgentId = `agent_mock_${crypto.randomUUID().slice(0, 8)}`;
    const externalLlmId = `llm_mock_${crypto.randomUUID().slice(0, 8)}`;
    agents.set(externalAgentId, { name: input.name, llmId: externalLlmId });
    return { externalAgentId, externalLlmId };
  },

  async updateAgent(externalAgentId, input) {
    const existing = agents.get(externalAgentId);
    if (!existing) return;
    if (input.name) existing.name = input.name;
    agents.set(externalAgentId, existing);
  },

  async publishAgent(externalAgentId) {
    if (!externalAgentId) throw new Error("Missing mock agent id");
  },

  async initiateTestCall(input) {
    const externalCallId = `call_mock_${crypto.randomUUID().slice(0, 8)}`;
    calls.set(externalCallId, { status: "ended" });
    void input;
    return { externalCallId };
  },

  async getCall(externalCallId) {
    return { status: calls.get(externalCallId)?.status ?? "unknown", raw: {} };
  },

  async transferCall() {
    // no-op
  },

  async verifyWebhook() {
    return process.env.NODE_ENV !== "production";
  },
};
