import { describe, expect, it } from "vitest";
import { PRICING_PLANS } from "./pricing";
import { resolveStripePriceId } from "@/modules/billing/plans";

describe("PRICING_PLANS", () => {
  it("defines exactly three plans in order", () => {
    expect(PRICING_PLANS).toHaveLength(3);
    expect(PRICING_PLANS.map((p) => p.id)).toEqual(["starter", "professional", "business"]);
  });

  it("marks Professional as most popular", () => {
    const professional = PRICING_PLANS.find((p) => p.id === "professional");
    expect(professional?.popular).toBe(true);
    expect(PRICING_PLANS.filter((p) => p.popular)).toHaveLength(1);
  });

  it("matches Starter pricing and limits", () => {
    const starter = PRICING_PLANS.find((p) => p.id === "starter")!;
    expect(starter.monthlyPriceUsd).toBe(79);
    expect(starter.annualPriceUsd).toBe(63);
    expect(starter.minutesIncluded).toBe(500);
    expect(starter.phoneNumbers).toBe(1);
    expect(starter.aiAgents).toBe(1);
    expect(starter.teamMembers).toBe(3);
    expect(starter.locations).toBe(1);
    expect(starter.knowledgeDocuments).toBe(25);
    expect(starter.overagePerMinuteUsd).toBe(0.12);
    expect(starter.trialDays).toBe(14);
    expect(starter.corePromise.toLowerCase()).toContain("ai receptionist");
  });

  it("matches Professional pricing and limits", () => {
    const professional = PRICING_PLANS.find((p) => p.id === "professional")!;
    expect(professional.monthlyPriceUsd).toBe(199);
    expect(professional.annualPriceUsd).toBe(159);
    expect(professional.minutesIncluded).toBe(2500);
    expect(professional.phoneNumbers).toBe(5);
    expect(professional.aiAgents).toBe(3);
    expect(professional.teamMembers).toBe(15);
    expect(professional.locations).toBe(3);
    expect(professional.knowledgeDocuments).toBe(250);
    expect(professional.overagePerMinuteUsd).toBe(0.1);
  });

  it("matches Business pricing and limits", () => {
    const business = PRICING_PLANS.find((p) => p.id === "business")!;
    expect(business.monthlyPriceUsd).toBe(449);
    expect(business.annualPriceUsd).toBe(359);
    expect(business.minutesIncluded).toBe(8000);
    expect(business.phoneNumbers).toBe(20);
    expect(business.aiAgents).toBe(10);
    expect(business.teamMembers).toBe(50);
    expect(business.locations).toBe(15);
    expect(business.knowledgeDocuments).toBe(1000);
    expect(business.overagePerMinuteUsd).toBe(0.08);
  });

  it("includes key packaging feature strings", () => {
    const byId = Object.fromEntries(PRICING_PLANS.map((p) => [p.id, p.features.join(" | ")]));
    expect(byId.starter).toMatch(/AI Receptionist/i);
    expect(byId.professional).toMatch(/CRM/i);
    expect(byId.professional).toMatch(/Everything in Starter/i);
    expect(byId.business).toMatch(/Live Call Monitor/i);
    expect(byId.business).toMatch(/Everything in Professional/i);
  });

  it("keeps Stripe price env keys for each plan", () => {
    for (const plan of PRICING_PLANS) {
      expect(plan.stripePriceEnvMonthly).toMatch(/^STRIPE_PRICE_/);
      expect(plan.stripePriceEnvAnnual).toMatch(/^STRIPE_PRICE_/);
      expect(plan.stripePriceEnvAnnual).toContain("ANNUAL");
    }
    expect(PRICING_PLANS[0]!.stripePriceEnvMonthly).toBe("STRIPE_PRICE_STARTER");
    expect(PRICING_PLANS[1]!.stripePriceEnvMonthly).toBe("STRIPE_PRICE_PROFESSIONAL");
    expect(PRICING_PLANS[2]!.stripePriceEnvMonthly).toBe("STRIPE_PRICE_BUSINESS");
  });

  it("resolves mock Stripe price ids when env is unset", () => {
    expect(resolveStripePriceId("starter", "month")).toBe("price_mock_starter_month");
    expect(resolveStripePriceId("professional", "year")).toBe("price_mock_professional_year");
    expect(resolveStripePriceId("business", "month")).toBe("price_mock_business_month");
  });
});
