import twilio from "twilio";
import type { TelephonyProvider } from "../types";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  }
  return twilio(accountSid, authToken);
}

function getAuthToken(): string {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken) throw new Error("TWILIO_AUTH_TOKEN is required");
  return authToken;
}

function webhookBase(): string {
  return (
    process.env.TWILIO_WEBHOOK_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export const twilioTelephonyProvider: TelephonyProvider = {
  name: "twilio",

  async listNumbers(organizationId) {
    void organizationId;
    const client = getClient();
    const numbers = await client.incomingPhoneNumbers.list({ limit: 50 });
    return numbers.map((n) => ({
      e164: n.phoneNumber,
      friendlyName: n.friendlyName ?? undefined,
    }));
  },

  async provisionNumber(input) {
    const client = getClient();
    const areaCode = input.areaCode ?? "415";
    const available = await client.availablePhoneNumbers("US").local.list({
      areaCode: Number(areaCode),
      limit: 1,
      voiceEnabled: true,
    });
    const first = available[0];
    if (!first?.phoneNumber) {
      throw new Error(`No Twilio numbers available for area code ${areaCode}`);
    }

    const base = webhookBase();
    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber: first.phoneNumber,
      friendlyName: `AgentDesk ${input.organizationId.slice(0, 8)}`,
      voiceUrl: `${base}/api/webhooks/twilio/voice`,
      voiceMethod: "POST",
      statusCallback: `${base}/api/webhooks/twilio/status`,
      statusCallbackMethod: "POST",
    });

    return { e164: purchased.phoneNumber, providerSid: purchased.sid };
  },

  async connectNumber(input) {
    const client = getClient();
    const base = webhookBase();
    const matches = await client.incomingPhoneNumbers.list({ phoneNumber: input.e164, limit: 1 });
    const existing = matches[0];
    if (!existing) throw new Error(`Twilio number not found: ${input.e164}`);

    const updated = await client.incomingPhoneNumbers(existing.sid).update({
      voiceUrl: `${base}/api/webhooks/twilio/voice`,
      voiceMethod: "POST",
      statusCallback: `${base}/api/webhooks/twilio/status`,
      statusCallbackMethod: "POST",
    });
    return { providerSid: updated.sid };
  },

  async configureForwarding(input) {
    const client = getClient();
    const matches = await client.incomingPhoneNumbers.list({ phoneNumber: input.e164, limit: 1 });
    const existing = matches[0];
    if (!existing) throw new Error(`Twilio number not found: ${input.e164}`);

    const twimlUrl = `${webhookBase()}/api/webhooks/twilio/voice?forwardTo=${encodeURIComponent(input.forwardTo)}`;
    await client.incomingPhoneNumbers(existing.sid).update({
      voiceUrl: twimlUrl,
      voiceMethod: "POST",
    });
  },

  async sendSms(input) {
    const client = getClient();
    const from = input.from || process.env.TWILIO_PHONE_NUMBER?.trim();
    if (!from) throw new Error("TWILIO_PHONE_NUMBER (or from) is required for SMS");
    const msg = await client.messages.create({
      to: input.to,
      from,
      body: input.body,
    });
    return { sid: msg.sid };
  },

  async verifyWebhook(headers, rawBody) {
    const signature = headers.get("x-twilio-signature") ?? headers.get("X-Twilio-Signature");
    if (!signature) {
      return process.env.NODE_ENV !== "production";
    }

    try {
      const authToken = getAuthToken();
      const url =
        headers.get("x-forwarded-proto") && headers.get("x-forwarded-host")
          ? `${headers.get("x-forwarded-proto")}://${headers.get("x-forwarded-host")}${headers.get("x-invoke-path") ?? ""}`
          : process.env.TWILIO_WEBHOOK_BASE_URL
            ? `${process.env.TWILIO_WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/webhooks/twilio/status`
            : "";

      // Twilio signs the full request URL + sorted POST params.
      // For application/x-www-form-urlencoded bodies, parse params.
      const params: Record<string, string> = {};
      if (rawBody.includes("=")) {
        for (const part of rawBody.split("&")) {
          const [k, v] = part.split("=");
          if (k) params[decodeURIComponent(k)] = decodeURIComponent((v ?? "").replace(/\+/g, " "));
        }
      }

      const requestUrl =
        headers.get("x-twilio-request-url") ||
        url ||
        `${webhookBase()}/api/webhooks/twilio/status`;

      return twilio.validateRequest(authToken, signature, requestUrl, params);
    } catch {
      return process.env.NODE_ENV !== "production";
    }
  },
};
