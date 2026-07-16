import type { VoiceProvider } from "../types";

/**
 * Retell adapter stub — real API wiring in Phase G.
 * Selected when VOICE_PROVIDER=retell; throws until implemented.
 */
export const retellVoiceProvider: VoiceProvider = {
  name: "retell",

  async createAgent() {
    throw new Error("Retell adapter not implemented yet. Use VOICE_PROVIDER=mock for Phase A.");
  },
  async updateAgent() {
    throw new Error("Retell adapter not implemented yet.");
  },
  async publishAgent() {
    throw new Error("Retell adapter not implemented yet.");
  },
  async initiateTestCall() {
    throw new Error("Retell adapter not implemented yet.");
  },
  async getCall() {
    throw new Error("Retell adapter not implemented yet.");
  },
  async transferCall() {
    throw new Error("Retell adapter not implemented yet.");
  },
  async verifyWebhook() {
    const secret = process.env.RETELL_WEBHOOK_SECRET?.trim();
    if (!secret) return false;
    // Signature verification implemented in Phase G
    return false;
  },
};
