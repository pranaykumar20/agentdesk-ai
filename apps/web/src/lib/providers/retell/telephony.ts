import type { TelephonyProvider } from "../types";

const RETELL_API = "https://api.retellai.com";

function getApiKey(): string {
  const key = process.env.RETELL_API_KEY?.trim();
  if (!key) throw new Error("RETELL_API_KEY is not configured");
  return key;
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

type RetellPhone = {
  phone_number?: string;
  phone_number_pretty?: string;
  nickname?: string;
};

/**
 * Retell-native telephony: buy/bind numbers on Retell (inbound AI path).
 * Twilio remains available via TELEPHONY_PROVIDER=twilio for later SMS/bridge work.
 */
export const retellTelephonyProvider: TelephonyProvider = {
  name: "retell",

  async listNumbers() {
    const numbers = await retellFetch<RetellPhone[]>("/list-phone-numbers", { method: "GET" });
    return (numbers ?? []).map((n) => ({
      e164: n.phone_number ?? "",
      friendlyName: n.nickname ?? n.phone_number_pretty,
    })).filter((n) => n.e164);
  },

  async provisionNumber(input) {
    if (!input.inboundAgentId) {
      throw new Error("inboundAgentId is required to provision a Retell phone number");
    }
    const body: Record<string, unknown> = {
      inbound_agent_id: input.inboundAgentId,
      outbound_agent_id: input.inboundAgentId,
    };
    if (input.areaCode) {
      const area = Number(input.areaCode);
      if (Number.isFinite(area)) body.area_code = area;
    }

    const created = await retellFetch<RetellPhone>("/create-phone-number", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const e164 = created.phone_number;
    if (!e164) throw new Error("Retell create-phone-number returned no phone_number");
    return { e164, providerSid: e164 };
  },

  async connectNumber(input) {
    if (input.inboundAgentId) {
      await retellFetch(`/update-phone-number/${encodeURIComponent(input.e164)}`, {
        method: "PATCH",
        body: JSON.stringify({
          inbound_agent_id: input.inboundAgentId,
          outbound_agent_id: input.inboundAgentId,
        }),
      });
    }
    return { providerSid: input.e164 };
  },

  async configureForwarding(input) {
    await retellFetch(`/update-phone-number/${encodeURIComponent(input.e164)}`, {
      method: "PATCH",
      body: JSON.stringify({ fallback_number: input.forwardTo }),
    });
  },

  async sendSms() {
    throw new Error("SMS is not supported via Retell telephony provider; use Twilio");
  },

  async verifyWebhook() {
    // Retell phone inbound does not hit our Twilio voice webhook.
    return process.env.NODE_ENV !== "production";
  },
};
