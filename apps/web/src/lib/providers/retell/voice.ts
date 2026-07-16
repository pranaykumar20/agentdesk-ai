import { createHmac, timingSafeEqual } from "node:crypto";
import type { VoiceAgentInput, VoiceProvider } from "../types";

const RETELL_API = "https://api.retellai.com";

function getApiKey(): string {
  const key = process.env.RETELL_API_KEY?.trim();
  if (!key) throw new Error("RETELL_API_KEY is not configured");
  return key;
}

function webhookSigningKey(): string {
  // Prefer dedicated webhook secret; Retell docs also allow the webhook-badged API key.
  return process.env.RETELL_WEBHOOK_SECRET?.trim() || process.env.RETELL_API_KEY?.trim() || "";
}

async function retellFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${RETELL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Retell ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function verifyRetellSignature(rawBody: string, signatureHeader: string, apiKey: string): boolean {
  const match = /v=(\d+),d=([0-9a-fA-F]+)/.exec(signatureHeader);
  if (!match) return false;
  const timestamp = match[1]!;
  const digest = match[2]!;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", apiKey)
    .update(rawBody + timestamp)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(digest, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const retellVoiceProvider: VoiceProvider = {
  name: "retell",

  async createAgent(input: VoiceAgentInput) {
    const llm = await retellFetch<{ llm_id: string }>("/create-retell-llm", {
      method: "POST",
      body: JSON.stringify({
        general_prompt: input.systemPrompt ?? `You are ${input.name}, a helpful AI phone receptionist.`,
        begin_message: input.greeting ?? `Hi, thanks for calling. How can I help you today?`,
      }),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const agent = await retellFetch<{ agent_id: string }>("/create-agent", {
      method: "POST",
      body: JSON.stringify({
        agent_name: input.name,
        voice_id: input.voice || "11labs-Adrian",
        language: input.language || "en-US",
        response_engine: { type: "retell-llm", llm_id: llm.llm_id },
        webhook_url: `${appUrl}/api/webhooks/retell`,
        webhook_events: ["call_started", "call_ended", "call_analyzed"],
      }),
    });

    return { externalAgentId: agent.agent_id };
  },

  async updateAgent(externalAgentId, input) {
    const patch: Record<string, unknown> = {};
    if (input.name) patch.agent_name = input.name;
    if (input.voice) patch.voice_id = input.voice;
    if (input.language) patch.language = input.language;
    if (Object.keys(patch).length === 0) return;

    await retellFetch(`/update-agent/${externalAgentId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  async publishAgent(externalAgentId) {
    // Retell agents are live after create/update; publish is a no-op acknowledgment.
    if (!externalAgentId) throw new Error("Missing Retell agent id");
  },

  async initiateTestCall(input) {
    const from = process.env.RETELL_FROM_NUMBER?.trim() || process.env.TWILIO_PHONE_NUMBER?.trim();
    if (!from) throw new Error("RETELL_FROM_NUMBER (or TWILIO_PHONE_NUMBER) required for test calls");

    const call = await retellFetch<{ call_id: string }>("/v2/create-phone-call", {
      method: "POST",
      body: JSON.stringify({
        from_number: from,
        to_number: input.toNumber,
        override_agent_id: input.externalAgentId,
      }),
    });
    return { externalCallId: call.call_id };
  },

  async getCall(externalCallId) {
    const call = await retellFetch<{ call_status?: string } & Record<string, unknown>>(
      `/v2/get-call/${externalCallId}`,
    );
    return { status: String(call.call_status ?? "unknown"), raw: call };
  },

  async transferCall(externalCallId, target) {
    await retellFetch(`/v2/transfer-call/${externalCallId}`, {
      method: "POST",
      body: JSON.stringify({ to_number: target }),
    });
  },

  async verifyWebhook(headers, rawBody) {
    const key = webhookSigningKey();
    if (!key) {
      // Allow in non-production when secret missing (local mock of retell mode)
      return process.env.NODE_ENV !== "production";
    }
    const signature =
      headers.get("x-retell-signature") ?? headers.get("X-Retell-Signature") ?? "";
    if (!signature) return false;
    return verifyRetellSignature(rawBody, signature, key);
  },
};
