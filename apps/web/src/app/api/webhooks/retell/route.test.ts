import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyWebhook = vi.fn();
const enqueue = vi.fn();
const claimWebhookEvent = vi.fn();
const completeWebhookEvent = vi.fn();

vi.mock("@/lib/providers", () => ({
  getVoiceProvider: () => ({
    name: "retell",
    verifyWebhook,
  }),
}));

vi.mock("@/lib/jobs", () => ({
  getJobsProvider: () => ({
    enqueue,
  }),
}));

vi.mock("@/lib/webhooks/idempotency", () => ({
  claimWebhookEvent,
  completeWebhookEvent,
}));

describe("POST /api/webhooks/retell", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    enqueue.mockResolvedValue({ jobId: "job_1" });
    completeWebhookEvent.mockResolvedValue(undefined);
  });

  it("returns 401 when signature is invalid", async () => {
    verifyWebhook.mockResolvedValue(false);
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/retell", {
        method: "POST",
        body: JSON.stringify({ event: "call_ended", call: { call_id: "c1" } }),
      }),
    );
    expect(res.status).toBe(401);
    expect(claimWebhookEvent).not.toHaveBeenCalled();
  });

  it("returns duplicate without enqueue when claim fails", async () => {
    verifyWebhook.mockResolvedValue(true);
    claimWebhookEvent.mockResolvedValue({ claimed: false, reason: "duplicate" });
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/retell", {
        method: "POST",
        body: JSON.stringify({ event: "call_ended", call: { call_id: "c1" } }),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe(true);
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("enqueues call_ended work when claimed", async () => {
    verifyWebhook.mockResolvedValue(true);
    claimWebhookEvent.mockResolvedValue({ claimed: true, eventId: "evt_1" });
    const { POST } = await import("./route");
    const body = { event: "call_ended", call: { call_id: "c1" } };
    const res = await POST(
      new Request("http://localhost/api/webhooks/retell", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    expect(res.status).toBe(200);
    expect(enqueue).toHaveBeenCalledWith(
      "process_retell_call_ended",
      expect.objectContaining({ callId: "c1" }),
    );
    expect(completeWebhookEvent).toHaveBeenCalledWith("evt_1", { status: "processed" });
  });
});
