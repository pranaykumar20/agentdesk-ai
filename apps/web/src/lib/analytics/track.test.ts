import { afterEach, describe, expect, it, vi } from "vitest";

describe("track", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("no-ops safely without a browser window", async () => {
    vi.stubGlobal("window", undefined);
    const { track } = await import("./track");
    expect(() => track("faq_opened")).not.toThrow();
  });

  it("pushes events to window.dataLayer when available", async () => {
    const dataLayer: Array<Record<string, unknown>> = [];
    vi.stubGlobal("window", { dataLayer });
    const { track } = await import("./track");
    track("hero_start_trial_clicked", { href: "/signup" });
    expect(dataLayer).toHaveLength(1);
    expect(dataLayer[0]?.event).toBe("hero_start_trial_clicked");
    expect(dataLayer[0]?.href).toBe("/signup");
  });
});
