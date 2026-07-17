import { describe, expect, it } from "vitest";
import { HOMEPAGE_FAQ } from "./faq";
import { MARKETING_NAV, FOOTER_COLUMNS } from "./navigation";
import { PLATFORM_GROUPS } from "./platform";
import { AI_EMPLOYEES, HERO, OUTCOMES, USE_CASES } from "./homepage";
import { PRICING_PLANS } from "@/lib/marketing/pricing";

describe("marketing content", () => {
  it("positions hero as workforce OS", () => {
    expect(HERO.title.toLowerCase()).toContain("ai workforce");
    expect(HERO.primaryCta.href).toBe("/signup");
    expect(HERO.secondaryCta.href).toBe("/audit");
  });

  it("includes a lean primary nav", () => {
    const ids = MARKETING_NAV.map((g) => g.id);
    expect(ids).toEqual(["product", "solutions", "pricing", "resources"]);
    expect(MARKETING_NAV.find((g) => g.id === "product")?.items?.some((i) => i.label === "AI Employees")).toBe(
      true,
    );
    expect(MARKETING_NAV.find((g) => g.id === "solutions")?.items?.some((i) => i.label === "Industries")).toBe(
      true,
    );
  });

  it("has complete FAQ and platform groups", () => {
    expect(HOMEPAGE_FAQ.length).toBeGreaterThanOrEqual(10);
    expect(PLATFORM_GROUPS.map((g) => g.id)).toEqual([
      "build",
      "automate",
      "communicate",
      "manage",
      "measure",
    ]);
    expect(OUTCOMES).toHaveLength(8);
    expect(AI_EMPLOYEES.length).toBe(8);
    expect(AI_EMPLOYEES.every((e) => e.capabilities.length === 3)).toBe(true);
  });

  it("labels use cases as samples without fake quotes", () => {
    for (const useCase of USE_CASES) {
      expect(useCase.before.length).toBeGreaterThan(10);
      expect(useCase.workflow.toLowerCase()).not.toContain("said");
    }
  });

  it("reuses shared pricing plans", () => {
    expect(PRICING_PLANS.map((p) => p.id)).toEqual(["starter", "professional", "business"]);
    expect(FOOTER_COLUMNS.length).toBeGreaterThanOrEqual(5);
  });
});
