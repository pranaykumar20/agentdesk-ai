import type { TelephonyProvider } from "../types";
import { vapiFetch, vapiServerUrl } from "./client";

type VapiPhone = {
  id?: string;
  number?: string;
  name?: string;
};

/**
 * Vapi-native telephony: buy/bind numbers on Vapi (inbound AI path).
 */
export const vapiTelephonyProvider: TelephonyProvider = {
  name: "vapi",

  async listNumbers() {
    const numbers = await vapiFetch<VapiPhone[]>("/phone-number", { method: "GET" });
    return (numbers ?? [])
      .map((n) => ({
        e164: n.number ?? "",
        friendlyName: n.name ?? n.number,
      }))
      .filter((n) => n.e164);
  },

  async provisionNumber(input) {
    if (!input.inboundAgentId) {
      throw new Error("inboundAgentId is required to provision a Vapi phone number");
    }

    const body: Record<string, unknown> = {
      provider: "vapi",
      assistantId: input.inboundAgentId,
      name: "AI Receptionist Line",
      server: { url: vapiServerUrl() },
    };
    if (input.areaCode) {
      const area = String(input.areaCode).replace(/\D/g, "").slice(0, 3);
      if (area.length === 3) body.numberDesiredAreaCode = area;
    }

    const created = await vapiFetch<VapiPhone>("/phone-number", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const e164 = created.number;
    const id = created.id;
    if (!e164) throw new Error("Vapi create phone-number returned no number");
    if (!id) throw new Error("Vapi create phone-number returned no id");
    return { e164, providerSid: id };
  },

  async connectNumber(input) {
    if (!input.inboundAgentId) {
      return { providerSid: input.e164 };
    }

    // Prefer lookup by stored provider sid (Vapi phone id). Fall back to matching e164.
    const numbers = await vapiFetch<VapiPhone[]>("/phone-number", { method: "GET" });
    const match =
      numbers.find((n) => n.id === input.e164) ||
      numbers.find((n) => n.number === input.e164);

    if (!match?.id) {
      throw new Error(`Vapi phone number not found for ${input.e164}`);
    }

    await vapiFetch(`/phone-number/${encodeURIComponent(match.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        provider: "vapi",
        assistantId: input.inboundAgentId,
        server: { url: vapiServerUrl() },
      }),
    });

    return { providerSid: match.id };
  },

  async configureForwarding(input) {
    const numbers = await vapiFetch<VapiPhone[]>("/phone-number", { method: "GET" });
    const match =
      numbers.find((n) => n.id === input.e164) ||
      numbers.find((n) => n.number === input.e164);
    if (!match?.id) {
      throw new Error(`Vapi phone number not found for ${input.e164}`);
    }

    await vapiFetch(`/phone-number/${encodeURIComponent(match.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        provider: "vapi",
        fallbackDestination: {
          type: "number",
          number: input.forwardTo,
        },
      }),
    });
  },

  async sendSms() {
    throw new Error("SMS is not supported via Vapi telephony provider; use Twilio");
  },

  async verifyWebhook() {
    return process.env.NODE_ENV !== "production";
  },
};
