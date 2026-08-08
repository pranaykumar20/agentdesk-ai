import { describe, expect, it } from "vitest";
import { getPlanFeatures, planHasFeature, PLAN_FEATURES } from "./feature-access";

describe("plan feature access", () => {
  it("defines features for all three plans", () => {
    expect(Object.keys(PLAN_FEATURES).sort()).toEqual(["business", "professional", "starter"]);
  });

  it("gives Starter core receptionist modules only", () => {
    expect(planHasFeature("starter", "dashboard")).toBe(true);
    expect(planHasFeature("starter", "calls")).toBe(true);
    expect(planHasFeature("starter", "appointments_basic")).toBe(true);
    expect(planHasFeature("starter", "ai_employees")).toBe(true);
    expect(planHasFeature("starter", "phone_numbers")).toBe(true);
    expect(planHasFeature("starter", "leads_basic")).toBe(true);
    expect(planHasFeature("starter", "ai_employees_multi")).toBe(false);
    expect(planHasFeature("starter", "crm")).toBe(false);
    expect(planHasFeature("starter", "roi")).toBe(false);
    expect(planHasFeature("starter", "whatsapp")).toBe(false);
  });

  it("includes Professional growth modules and inherits Starter", () => {
    expect(planHasFeature("professional", "dashboard")).toBe(true);
    expect(planHasFeature("professional", "crm")).toBe(true);
    expect(planHasFeature("professional", "contact_center")).toBe(true);
    expect(planHasFeature("professional", "analytics_export")).toBe(true);
    expect(planHasFeature("professional", "roi")).toBe(false);
    expect(planHasFeature("professional", "live_monitor")).toBe(false);
  });

  it("includes Business workforce modules and inherits Professional", () => {
    expect(planHasFeature("business", "crm")).toBe(true);
    expect(planHasFeature("business", "roi")).toBe(true);
    expect(planHasFeature("business", "whatsapp")).toBe(true);
    expect(planHasFeature("business", "live_monitor")).toBe(true);
    expect(planHasFeature("business", "locations_multi")).toBe(true);
    expect(planHasFeature("business", "dedicated_success")).toBe(true);
  });

  it("returns the feature list via getPlanFeatures", () => {
    expect(getPlanFeatures("starter").length).toBeLessThan(getPlanFeatures("professional").length);
    expect(getPlanFeatures("professional").length).toBeLessThan(getPlanFeatures("business").length);
  });
});
