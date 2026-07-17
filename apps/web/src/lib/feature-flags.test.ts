import { describe, expect, it } from "vitest";
import { isFeatureEnabled, resolveFeatureFlags } from "./feature-flags";

describe("feature flags", () => {
  it("defaults AI employees, CRM, and ops modules on", () => {
    expect(isFeatureEnabled("ai_employees")).toBe(true);
    expect(isFeatureEnabled("crm")).toBe(true);
    expect(isFeatureEnabled("contact_center")).toBe(true);
    expect(isFeatureEnabled("call_queues")).toBe(true);
    expect(isFeatureEnabled("live_monitor")).toBe(true);
    expect(isFeatureEnabled("workflows")).toBe(true);
    expect(isFeatureEnabled("voice_flows")).toBe(true);
    expect(isFeatureEnabled("marketplace")).toBe(true);
    expect(isFeatureEnabled("sms_campaigns")).toBe(true);
    expect(isFeatureEnabled("training")).toBe(true);
    expect(isFeatureEnabled("roi")).toBe(true);
    expect(isFeatureEnabled("website_importer")).toBe(false);
  });

  it("applies org overrides", () => {
    expect(isFeatureEnabled("workflows", { workflows: true })).toBe(true);
    expect(isFeatureEnabled("ai_employees", { ai_employees: false })).toBe(false);
  });

  it("resolves full map", () => {
    const flags = resolveFeatureFlags({ website_importer: true });
    expect(flags.website_importer).toBe(true);
    expect(flags.roi).toBe(true);
  });
});
