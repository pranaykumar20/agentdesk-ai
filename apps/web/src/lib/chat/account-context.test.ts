import { describe, expect, it } from "vitest";
import { buildAccountSnapshot, maskPhone } from "./account-context";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";

function makeCtx(role: OrgContext["role"]): OrgContext {
  const organization = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test Dental",
    slug: "test-dental",
    industry: "healthcare_dental",
    timezone: "America/New_York",
    onboarding_step: 5,
    onboarding_completed_at: new Date().toISOString(),
    stripe_customer_id: "cus_secret_should_not_leak",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  } satisfies Organization;

  const membership = {
    id: "22222222-2222-2222-2222-222222222222",
    organization_id: organization.id,
    user_id: "33333333-3333-3333-3333-333333333333",
    role,
    status: "active",
    invited_email: null,
    invited_at: null,
    joined_at: new Date().toISOString(),
    last_active_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } satisfies OrganizationMember;

  return { organization, membership, role };
}

describe("maskPhone", () => {
  it("masks all but last 4 digits", () => {
    expect(maskPhone("+1 (513) 555-0187")).toBe("***-***-0187");
    expect(maskPhone("555")).toBe("***");
    expect(maskPhone(null)).toBeNull();
  });
});

describe("buildAccountSnapshot", () => {
  it("scopes to org and never exposes stripe customer id", async () => {
    const snapshot = await buildAccountSnapshot(makeCtx("OWNER"));
    expect(snapshot.organization.id).toBe("11111111-1111-1111-1111-111111111111");
    expect(snapshot.organization.name).toBe("Test Dental");
    expect(JSON.stringify(snapshot)).not.toContain("cus_secret_should_not_leak");
    expect(snapshot.readOnly).toBe(true);
    expect(snapshot.calls).not.toHaveProperty("denied");
    expect(snapshot.billing).not.toHaveProperty("denied");
  });

  it("denies billing and team for AGENT role", async () => {
    const snapshot = await buildAccountSnapshot(makeCtx("AGENT"));
    expect(snapshot.billing).toEqual({ denied: true });
    expect(snapshot.team).toEqual({ denied: true });
    expect(snapshot.viewer.deniedResources).toContain("billing");
    expect(snapshot.viewer.deniedResources).toContain("members");
    expect(snapshot.calls).not.toEqual({ denied: true });
  });
});
