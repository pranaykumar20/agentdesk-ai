import { describe, expect, it } from "vitest";
import { buildDemoCalls } from "./demo-data";

describe("buildDemoCalls", () => {
  it("creates paginated-ready demo calls for an org", () => {
    const calls = buildDemoCalls("org-1");
    expect(calls.length).toBeGreaterThanOrEqual(30);
    expect(calls.every((c) => c.organizationId === "org-1")).toBe(true);
    expect(calls.some((c) => c.status === "missed")).toBe(true);
    expect(calls.some((c) => c.status === "voicemail")).toBe(true);
  });
});
