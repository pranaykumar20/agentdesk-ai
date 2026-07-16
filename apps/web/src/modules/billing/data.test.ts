import { describe, expect, it } from "vitest";
import { applyCheckoutToDemo, getDemoSubscription, withUsageDerived } from "./demo-data";
import { computeUsageAlert } from "./data";
import { planKeyFromPriceId, resolveStripePriceId } from "./plans";

describe("billing usage", () => {
  it("derives overage from minutes used", () => {
    const base = getDemoSubscription(`org-bill-${Date.now()}`);
    const over = withUsageDerived({
      ...base,
      minutesIncluded: 1000,
      minutesUsed: 1250,
      overagePerMinuteUsd: 0.1,
    });
    expect(over.overageMinutes).toBe(250);
    expect(over.estimatedOverageUsd).toBe(25);
    expect(computeUsageAlert(over)).toBe("critical");
  });

  it("applies mock checkout plan change", () => {
    const orgId = `org-checkout-${Date.now()}`;
    const next = applyCheckoutToDemo(orgId, "business", "year");
    expect(next.planKey).toBe("business");
    expect(next.interval).toBe("year");
    expect(next.status).toBe("active");
    expect(next.minutesIncluded).toBeGreaterThan(2000);
  });

  it("resolves plan keys from mock price ids", () => {
    expect(planKeyFromPriceId("price_mock_starter_month")).toBe("starter");
    expect(planKeyFromPriceId(resolveStripePriceId("professional", "month"))).toBe("professional");
  });
});
