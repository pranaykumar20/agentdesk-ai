import { afterEach, describe, expect, it, vi } from "vitest";
import * as handlers from "./handlers";
import { localJobsProvider } from "./local";

describe("localJobsProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enqueues and runs a handler on a microtask", async () => {
    const spy = vi.spyOn(handlers, "runJob").mockResolvedValue(undefined);

    await localJobsProvider.enqueue("process_twilio_status", {
      callSid: "CA123",
      status: "completed",
      raw: {},
    });

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith("process_twilio_status", {
        callSid: "CA123",
        status: "completed",
        raw: {},
      });
    });
  });
});
