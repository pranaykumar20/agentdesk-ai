import { describe, expect, it } from "vitest";
import { createRoutingRule, listRoutingRules, reorderRoutingRules } from "./data";

describe("routing rules", () => {
  it("reorders by ordered ids", async () => {
    const orgId = `org-routing-${Date.now()}`;
    await createRoutingRule({ organizationId: orgId, name: "A", description: "" });
    await createRoutingRule({ organizationId: orgId, name: "B", description: "" });
    const before = await listRoutingRules(orgId);
    expect(before.length).toBeGreaterThanOrEqual(2);

    const reversed = [...before].reverse().map((r) => r.id);
    const after = await reorderRoutingRules(orgId, reversed);
    expect(after.map((r) => r.id)).toEqual(reversed);
    expect(after[0]?.priority).toBeLessThan(after[1]?.priority ?? Infinity);
  });
});
