import { describe, expect, it } from "vitest";
import { filterNavForRole, isNavActive } from "./dashboard";
import { DEMO_FEATURE_FLAGS, MVP_FEATURE_FLAGS } from "@/lib/feature-flags";

describe("isNavActive", () => {
  it("matches dashboard root exactly", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/dashboard/calls", "/dashboard")).toBe(false);
  });

  it("matches nested routes for section hrefs", () => {
    expect(isNavActive("/dashboard/calls", "/dashboard/calls")).toBe(true);
    expect(isNavActive("/dashboard/calls/abc", "/dashboard/calls")).toBe(true);
    expect(isNavActive("/dashboard/appointments", "/dashboard/calls")).toBe(false);
  });
});

describe("filterNavForRole", () => {
  it("hides billing/settings for VIEWER but keeps read-capable sections", () => {
    const hrefs = filterNavForRole("VIEWER", MVP_FEATURE_FLAGS, "starter").map((i) => i.href);
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/dashboard/calls");
    expect(hrefs).toContain("/dashboard/leads");
    expect(hrefs).toContain("/dashboard/team");
    expect(hrefs).toContain("/dashboard/ai-employees");
    expect(hrefs).not.toContain("/dashboard/billing");
    expect(hrefs).not.toContain("/dashboard/settings");
    expect(hrefs).not.toContain("/dashboard/routing-rules");
  });

  it("includes billing for OWNER on Starter and hides Phase 2 modules", () => {
    const hrefs = filterNavForRole("OWNER", MVP_FEATURE_FLAGS, "starter").map((i) => i.href);
    expect(hrefs).toContain("/dashboard/billing");
    expect(hrefs).toContain("/dashboard/team");
    expect(hrefs).toContain("/dashboard/ai-employees");
    expect(hrefs).toContain("/dashboard/phone-numbers");
    expect(hrefs).toContain("/dashboard/leads");
    expect(hrefs).not.toContain("/dashboard/crm");
    expect(hrefs).not.toContain("/dashboard/workflows");
    expect(hrefs).not.toContain("/dashboard/integrations");
  });

  it("hides flagged-off modules even on Professional", () => {
    const hrefs = filterNavForRole(
      "OWNER",
      {
        ...DEMO_FEATURE_FLAGS,
        workflows: false,
        contact_center: false,
      },
      "professional",
    ).map((i) => i.href);
    expect(hrefs).not.toContain("/dashboard/workflows");
    expect(hrefs).not.toContain("/dashboard/contact-center");
    expect(hrefs).toContain("/dashboard/ai-employees");
    expect(hrefs).toContain("/dashboard/crm");
  });
});
