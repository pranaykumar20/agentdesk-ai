import { afterEach, describe, expect, it } from "vitest";
import { resolveOrganizationId } from "./write";

describe("resolveOrganizationId", () => {
  const prev = process.env.DEFAULT_WEBHOOK_ORG_ID;

  afterEach(() => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = prev;
  });

  it("prefers metadata.organization_id", async () => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    await expect(
      resolveOrganizationId({
        call_id: "c1",
        metadata: { organization_id: "org-meta" },
      }),
    ).resolves.toBe("org-meta");
  });

  it("accepts organizationId camelCase", async () => {
    await expect(
      resolveOrganizationId({
        call_id: "c1",
        metadata: { organizationId: "org-camel" },
      }),
    ).resolves.toBe("org-camel");
  });

  it("falls back to DEFAULT_WEBHOOK_ORG_ID", async () => {
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    await expect(resolveOrganizationId({ call_id: "c1", metadata: {} })).resolves.toBe(
      "fallback-org",
    );
  });

  it("returns null when metadata and fallback are missing", async () => {
    delete process.env.DEFAULT_WEBHOOK_ORG_ID;
    await expect(resolveOrganizationId({ call_id: "c1" })).resolves.toBeNull();
  });
});
