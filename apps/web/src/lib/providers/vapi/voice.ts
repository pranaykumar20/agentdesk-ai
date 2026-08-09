import { timingSafeEqual } from "node:crypto";
import type { VoiceAgentInput, VoiceProvider } from "../types";
import { vapiFetch, vapiServerUrl } from "./client";
import { buildVapiLanguageConfig } from "./language";

const ANALYSIS_PLAN = {
  summaryPlan: {
    enabled: true,
    messages: [
      {
        role: "system",
        content:
          "Summarize the call for restaurant staff. Note caller name, intent, any booking time, and follow-up needs.",
      },
    ],
  },
  structuredDataPlan: {
    enabled: true,
    schema: {
      type: "object",
      properties: {
        caller_name: { type: "string", description: "Full name of the caller if provided" },
        intent: {
          type: "string",
          description:
            "Primary caller intent such as appointment, reservation, order, callback, faq, or other",
        },
        callback_requested: {
          type: "boolean",
          description: "Whether the caller asked for a human callback",
        },
        appointment_start: {
          type: "string",
          description: "ISO-8601 datetime if an appointment or reservation time was agreed",
        },
        notes: {
          type: "string",
          description: "Short notes useful for staff follow-up",
        },
      },
    },
  },
  successEvaluationPlan: { enabled: false },
} as const;

function assistantPayload(input: VoiceAgentInput) {
  const lang = buildVapiLanguageConfig(input.language, input.voice);
  const systemPrompt =
    input.systemPrompt ?? `You are ${input.name}, a helpful AI phone receptionist.`;
  const firstMessage =
    input.greeting ?? `Hi, thanks for calling. How can I help you today?`;

  return {
    name: input.name,
    firstMessage,
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
    },
    voice: lang.voice,
    transcriber: lang.transcriber,
    server: { url: vapiServerUrl() },
    serverMessages: ["status-update", "end-of-call-report"],
    analysisPlan: ANALYSIS_PLAN,
    metadata: {
      organizationId: input.organizationId,
      language: lang.language,
    },
  };
}

export const vapiVoiceProvider: VoiceProvider = {
  name: "vapi",

  async createAgent(input: VoiceAgentInput) {
    const created = await vapiFetch<{ id: string }>("/assistant", {
      method: "POST",
      body: JSON.stringify(assistantPayload(input)),
    });
    return { externalAgentId: created.id };
  },

  async updateAgent(externalAgentId, input) {
    const patch: Record<string, unknown> = {};
    if (input.name) patch.name = input.name;
    if (input.greeting) patch.firstMessage = input.greeting;

    if (input.systemPrompt) {
      patch.model = {
        provider: "openai",
        model: "gpt-4o",
        messages: [{ role: "system", content: input.systemPrompt }],
      };
    }

    if (input.language || input.voice) {
      const lang = buildVapiLanguageConfig(input.language, input.voice);
      patch.voice = lang.voice;
      patch.transcriber = lang.transcriber;
      patch.metadata = {
        organizationId: input.organizationId,
        language: lang.language,
      };
    }

    // Keep webhook pointed at current app URL on updates.
    patch.server = { url: vapiServerUrl() };
    patch.serverMessages = ["status-update", "end-of-call-report"];

    if (Object.keys(patch).length === 0) return;

    await vapiFetch(`/assistant/${encodeURIComponent(externalAgentId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  async publishAgent(externalAgentId) {
    if (!externalAgentId) throw new Error("Missing Vapi assistant id");
  },

  async initiateTestCall(input) {
    const envPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID?.trim();
    const fromNumber =
      input.fromNumber?.trim() || process.env.VAPI_FROM_NUMBER?.trim();

    let phoneNumberId = envPhoneNumberId;
    // If caller passed an E.164 from a provisioned number, resolve Vapi phone id.
    if (!phoneNumberId && fromNumber?.startsWith("+")) {
      const numbers = await vapiFetch<Array<{ id?: string; number?: string }>>("/phone-number", {
        method: "GET",
      });
      phoneNumberId = numbers.find((n) => n.number === fromNumber)?.id;
    } else if (!phoneNumberId && fromNumber && !fromNumber.startsWith("+")) {
      // Already a Vapi phone number id
      phoneNumberId = fromNumber;
    }

    if (!phoneNumberId) {
      throw new Error(
        "A provisioned Vapi phone number (fromNumber / VAPI_PHONE_NUMBER_ID) is required for outbound test calls",
      );
    }

    const call = await vapiFetch<{ id: string }>("/call", {
      method: "POST",
      body: JSON.stringify({
        assistantId: input.externalAgentId,
        phoneNumberId,
        customer: { number: input.toNumber },
      }),
    });
    return { externalCallId: call.id };
  },

  async getCall(externalCallId) {
    const call = await vapiFetch<{ status?: string } & Record<string, unknown>>(
      `/call/${encodeURIComponent(externalCallId)}`,
    );
    return { status: String(call.status ?? "unknown"), raw: call };
  },

  async transferCall(externalCallId, target) {
    await vapiFetch(`/call/${encodeURIComponent(externalCallId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        destination: { type: "number", number: target },
      }),
    });
  },

  async verifyWebhook(headers, _rawBody) {
    const secret = process.env.VAPI_WEBHOOK_SECRET?.trim();
    const auth = headers.get("authorization") ?? headers.get("Authorization") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const headerSecret =
      headers.get("x-vapi-secret") ?? headers.get("X-Vapi-Secret") ?? bearer;

    // Local/dev: Vapi often posts without a custom credential. Allow unsigned
    // traffic outside production so dashboard Talk tests can sync calls.
    if (!secret) {
      return process.env.NODE_ENV !== "production";
    }
    if (!headerSecret) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[vapi] webhook accepted without secret in development — configure a Vapi server credential for production",
        );
        return true;
      }
      return false;
    }

    try {
      const a = Buffer.from(headerSecret);
      const b = Buffer.from(secret);
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  },
};
