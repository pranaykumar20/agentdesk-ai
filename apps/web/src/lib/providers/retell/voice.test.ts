import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { retellVoiceProvider } from "./voice";

function sign(rawBody: string, apiKey: string, timestamp = Date.now()): string {
  const digest = createHmac("sha256", apiKey)
    .update(rawBody + String(timestamp))
    .digest("hex");
  return `v=${timestamp},d=${digest}`;
}

describe("retellVoiceProvider.verifyWebhook", () => {
  const prevSecret = process.env.RETELL_WEBHOOK_SECRET;
  const prevApi = process.env.RETELL_API_KEY;

  beforeEach(() => {
    process.env.RETELL_WEBHOOK_SECRET = "test-webhook-secret";
    process.env.RETELL_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.RETELL_WEBHOOK_SECRET = prevSecret;
    process.env.RETELL_API_KEY = prevApi;
  });

  it("accepts a valid x-retell-signature", async () => {
    const body = JSON.stringify({ event: "call_ended", call: { call_id: "c1" } });
    const headers = new Headers({
      "x-retell-signature": sign(body, "test-webhook-secret"),
    });
    await expect(retellVoiceProvider.verifyWebhook(headers, body)).resolves.toBe(true);
  });

  it("rejects a tampered body", async () => {
    const body = JSON.stringify({ event: "call_ended" });
    const headers = new Headers({
      "x-retell-signature": sign(body, "test-webhook-secret"),
    });
    await expect(
      retellVoiceProvider.verifyWebhook(headers, body + " "),
    ).resolves.toBe(false);
  });

  it("rejects missing signature when secret is configured", async () => {
    const body = "{}";
    await expect(retellVoiceProvider.verifyWebhook(new Headers(), body)).resolves.toBe(false);
  });

  it("rejects expired timestamps", async () => {
    const body = "{}";
    const old = Date.now() - 10 * 60 * 1000;
    const headers = new Headers({
      "x-retell-signature": sign(body, "test-webhook-secret", old),
    });
    await expect(retellVoiceProvider.verifyWebhook(headers, body)).resolves.toBe(false);
  });
});
