import type { TelephonyProvider } from "../types";

const numbers = new Map<string, Array<{ e164: string; friendlyName?: string; providerSid: string }>>();

export const mockTelephonyProvider: TelephonyProvider = {
  name: "mock",

  async listNumbers(organizationId) {
    return (numbers.get(organizationId) ?? []).map(({ e164, friendlyName }) => ({
      e164,
      friendlyName,
    }));
  },

  async provisionNumber(input) {
    const area = input.areaCode ?? "513";
    const e164 = `+1${area}555${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const providerSid = `PN_mock_${crypto.randomUUID()}`;
    const list = numbers.get(input.organizationId) ?? [];
    list.push({ e164, friendlyName: "Mock Number", providerSid });
    numbers.set(input.organizationId, list);
    return { e164, providerSid };
  },

  async connectNumber(input) {
    const providerSid = `PN_mock_${crypto.randomUUID()}`;
    const list = numbers.get(input.organizationId) ?? [];
    list.push({ e164: input.e164, friendlyName: "Connected Number", providerSid });
    numbers.set(input.organizationId, list);
    return { providerSid };
  },

  async configureForwarding() {
    // no-op
  },

  async sendSms() {
    return { sid: `SM_mock_${crypto.randomUUID()}` };
  },

  async verifyWebhook() {
    return true;
  },
};
