import { describe, expect, it } from "vitest";
import { normalizePathname, resolvePageContext } from "./page-context";

describe("page context", () => {
  it("normalizes dashboard paths only", () => {
    expect(normalizePathname("/dashboard/calls")).toBe("/dashboard/calls");
    expect(normalizePathname("https://evil.example")).toBeNull();
    expect(normalizePathname("/settings")).toBeNull();
  });

  it("resolves known areas", () => {
    expect(resolvePageContext("/dashboard/billing")?.area).toBe("billing");
    expect(resolvePageContext("/dashboard/ai-employees/new")?.area).toBe("ai-employees");
  });
});
