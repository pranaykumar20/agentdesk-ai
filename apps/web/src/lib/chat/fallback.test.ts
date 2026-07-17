import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { tryTemplateFallback } from "./fallback";

function makeCtx(): OrgContext {
  const organization = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Eval Dental",
    slug: "eval-dental",
    industry: "healthcare_dental",
    timezone: "America/New_York",
    onboarding_step: 5,
    onboarding_completed_at: new Date().toISOString(),
    stripe_customer_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  } satisfies Organization;

  const membership = {
    id: "22222222-2222-2222-2222-222222222222",
    organization_id: organization.id,
    user_id: "33333333-3333-3333-3333-333333333333",
    role: "OWNER" as const,
    status: "active",
    invited_email: null,
    invited_at: null,
    joined_at: new Date().toISOString(),
    last_active_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } satisfies OrganizationMember;

  return { organization, membership, role: "OWNER" };
}

describe("tryTemplateFallback team matching", () => {
  it("matches curly apostrophe Who’s on my team", async () => {
    const answer = await tryTemplateFallback(makeCtx(), "Who’s on my team?");
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toContain("team");
    expect(answer!.reply.trim().length).toBeGreaterThan(0);
  });

  it("matches my team shorthand", async () => {
    const answer = await tryTemplateFallback(makeCtx(), "Show my team");
    expect(answer).not.toBeNull();
  });
});

describe("tryTemplateFallback appointments + call breakdown", () => {
  it("answers appointments booked", async () => {
    const answer = await tryTemplateFallback(
      makeCtx(),
      "How many appointments do I have booked?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toContain("appointment");
    expect(answer!.toolsUsed).toContain("list_appointments");
  });

  it("answers missed vs answered", async () => {
    const answer = await tryTemplateFallback(
      makeCtx(),
      "How many were missed vs answered?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toMatch(/answered|missed/);
    expect(answer!.toolsUsed).toContain("get_dashboard_metrics");
  });
});
