import { describe, expect, it } from "vitest";
import { claimWebhookEvent } from "./idempotency";

describe("claimWebhookEvent (memory fallback)", () => {
  it("claims a new key once and rejects duplicates", async () => {
    const key = `test-${crypto.randomUUID()}`;
    const first = await claimWebhookEvent({
      provider: "retell",
      idempotencyKey: key,
      eventType: "call_ended",
      payload: { ok: true },
    });
    expect(first.claimed).toBe(true);
    if (first.claimed) {
      expect(first.eventId).toMatch(/^mem_/);
    }

    const second = await claimWebhookEvent({
      provider: "retell",
      idempotencyKey: key,
      eventType: "call_ended",
      payload: { ok: true },
    });
    expect(second).toEqual({ claimed: false, reason: "duplicate" });
  });

  it("scopes keys by provider", async () => {
    const key = `shared-${crypto.randomUUID()}`;
    const a = await claimWebhookEvent({
      provider: "retell",
      idempotencyKey: key,
      payload: {},
    });
    const b = await claimWebhookEvent({
      provider: "stripe",
      idempotencyKey: key,
      payload: {},
    });
    expect(a.claimed).toBe(true);
    expect(b.claimed).toBe(true);
  });
});
