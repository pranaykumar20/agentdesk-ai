import { describe, expect, it } from "vitest";
import { pickActiveOrgId } from "./org-helpers";

describe("pickActiveOrgId", () => {
  it("returns null when user has no memberships", () => {
    expect(pickActiveOrgId([], "org-a")).toBeNull();
  });

  it("honors cookie only when membership includes that org", () => {
    expect(pickActiveOrgId(["org-a", "org-b"], "org-b")).toBe("org-b");
    expect(pickActiveOrgId(["org-a", "org-b"], "org-evil")).toBe("org-a");
  });

  it("falls back to first membership when cookie missing", () => {
    expect(pickActiveOrgId(["org-a", "org-b"], null)).toBe("org-a");
    expect(pickActiveOrgId(["org-a", "org-b"], undefined)).toBe("org-a");
  });
});
