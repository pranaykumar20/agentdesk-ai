import { afterEach, describe, expect, it } from "vitest";
import { resolveOrganizationId } from "./write";

describe("resolveOrganizationId", () => {
  const prev = process.env.DEFAULT_WEBHOOK_ORG_ID;

  afterEach(() => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = prev;
  });

  it("prefers metadata.organization_id", () => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    expect(
      resolveOrganizationId({
        call_id: "c1",
        metadata: { organization_id: "org-meta" },
      }),
    ).toBe("org-meta");
  });

  it("accepts organizationId camelCase", () => {
    expect(
      resolveOrganizationId({
        call_id: "c1",
        metadata: { organizationId: "org-camel" },
      }),
    ).toBe("org-camel");
  });

  it("falls back to DEFAULT_WEBHOOK_ORG_ID", () => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    expect(resolveOrganizationId({ call_id: "c1", metadata: {} })).toBe("fallback-org");
  });

  it("returns null when metadata and fallback are missing", () => {
    delete process.env.DEFAULT_WEBHOOK_ORG_ID;
    expect(resolveOrganizationId({ call_id: "c1" })).toBeNull();
  });
});
