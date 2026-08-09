import { afterEach, describe, expect, it } from "vitest";
import { resolveOrganizationId } from "./write";

describe("resolveOrganizationId", () => {
  const prevFallback = process.env.DEFAULT_WEBHOOK_ORG_ID;
  const prevAllow = process.env.ALLOW_WEBHOOK_ORG_FALLBACK;

  afterEach(() => {
    if (prevFallback === undefined) delete process.env.DEFAULT_WEBHOOK_ORG_ID;
    else process.env.DEFAULT_WEBHOOK_ORG_ID = prevFallback;
    if (prevAllow === undefined) delete process.env.ALLOW_WEBHOOK_ORG_FALLBACK;
    else process.env.ALLOW_WEBHOOK_ORG_FALLBACK = prevAllow;
  });

  it("prefers metadata.organization_id", async () => {
    process.env.ALLOW_WEBHOOK_ORG_FALLBACK = "true";
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

  it("falls back to DEFAULT_WEBHOOK_ORG_ID only when allowed", async () => {
    process.env.ALLOW_WEBHOOK_ORG_FALLBACK = "true";
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    await expect(resolveOrganizationId({ call_id: "c1", metadata: {} })).resolves.toBe(
      "fallback-org",
    );
  });

  it("does not fall back without ALLOW_WEBHOOK_ORG_FALLBACK", async () => {
    delete process.env.ALLOW_WEBHOOK_ORG_FALLBACK;
    process.env.DEFAULT_WEBHOOK_ORG_ID = "fallback-org";
    await expect(resolveOrganizationId({ call_id: "c1", metadata: {} })).resolves.toBeNull();
  });

  it("returns null when metadata and fallback are missing", async () => {
    delete process.env.DEFAULT_WEBHOOK_ORG_ID;
    delete process.env.ALLOW_WEBHOOK_ORG_FALLBACK;
    await expect(resolveOrganizationId({ call_id: "c1" })).resolves.toBeNull();
  });
});
