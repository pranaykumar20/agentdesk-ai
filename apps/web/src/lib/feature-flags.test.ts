import { describe, expect, it } from "vitest";
import { isFeatureEnabled, resolveFeatureFlags } from "./feature-flags";

describe("feature flags", () => {
  it("defaults Starter MVP modules on and Phase 2 shells off", () => {
    expect(isFeatureEnabled("ai_employees")).toBe(true);
    expect(isFeatureEnabled("onboarding_wizard")).toBe(true);
    expect(isFeatureEnabled("crm")).toBe(false);
    expect(isFeatureEnabled("contact_center")).toBe(false);
    expect(isFeatureEnabled("call_queues")).toBe(false);
    expect(isFeatureEnabled("live_monitor")).toBe(false);
    expect(isFeatureEnabled("workflows")).toBe(false);
    expect(isFeatureEnabled("voice_flows")).toBe(false);
    expect(isFeatureEnabled("marketplace")).toBe(false);
    expect(isFeatureEnabled("sms_campaigns")).toBe(false);
    expect(isFeatureEnabled("training")).toBe(false);
    expect(isFeatureEnabled("roi")).toBe(false);
    expect(isFeatureEnabled("website_importer")).toBe(false);
  });

  it("applies org overrides", () => {
    expect(isFeatureEnabled("workflows", { workflows: true })).toBe(true);
    expect(isFeatureEnabled("ai_employees", { ai_employees: false })).toBe(false);
  });

  it("resolves full map", () => {
    const flags = resolveFeatureFlags({ website_importer: true, roi: true });
    expect(flags.website_importer).toBe(true);
    expect(flags.roi).toBe(true);
    expect(flags.crm).toBe(false);
  });
});
