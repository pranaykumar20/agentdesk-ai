import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { tryTemplateFallback } from "./fallback";
import { executeAvaTool } from "./tools";
import { getExactDashboardMetrics } from "@/modules/analytics/exact-metrics";

function makeCtx(role: OrgContext["role"]): OrgContext {
  const organization = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Eval Dental",
    slug: "eval-dental",
    industry: "healthcare_dental",
    timezone: "America/New_York",
    onboarding_step: 5,
    onboarding_completed_at: new Date().toISOString(),
    stripe_customer_id: "cus_secret",
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

describe("Ava golden evals", () => {
  it("answers total calls from exact metrics", async () => {
    const ctx = makeCtx("OWNER");
    const metrics = await getExactDashboardMetrics(ctx.organization.id);
    const answer = await tryTemplateFallback(ctx, "How many total calls do I have?");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toContain(metrics.totalCalls.toLocaleString());
    expect(answer!.toolsUsed.some((t) => t.includes("calls") || t.includes("overview"))).toBe(
      true,
    );
    expect(
      answer!.citations.some((c) => c.path === "/dashboard" || c.path === "/dashboard/calls"),
    ).toBe(true);
  });

  it("answers plan usage for owners", async () => {
    const answer = await tryTemplateFallback(makeCtx("OWNER"), "What's my plan usage?");
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toMatch(/plan|minutes/);
  });

  it("denies billing for AGENT role", async () => {
    const answer = await tryTemplateFallback(makeCtx("AGENT"), "What's my plan usage?");
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toContain("permission");
  });

  it("lists AI employees", async () => {
    const answer = await tryTemplateFallback(makeCtx("OWNER"), "List my AI employees");
    expect(answer).not.toBeNull();
    expect(answer!.toolsUsed.some((t) => t.includes("ai_employees"))).toBe(true);
  });

  it("hides emails unless asked", async () => {
    const ctx = makeCtx("OWNER");
    const without = await executeAvaTool(ctx, "list_team_members", { includeEmails: false });
    const withEmail = await executeAvaTool(ctx, "list_team_members", { includeEmails: true });
    expect(without.ok).toBe(true);
    expect(withEmail.ok).toBe(true);
    const withoutMembers = (without.data as { members: Array<{ email?: string }> }).members;
    const withMembers = (withEmail.data as { members: Array<{ email?: string }> }).members;
    expect(withoutMembers[0]?.email).toBeUndefined();
    expect(withMembers[0]?.email).toBeTruthy();
  });

  it("proposes invite without mutating until confirm", async () => {
    const result = await executeAvaTool(makeCtx("OWNER"), "propose_invite_team_member", {
      fullName: "Sam Eval",
      email: "sam@example.com",
      role: "AGENT",
    });
    expect(result.ok).toBe(true);
    expect(result.proposedAction?.status).toBe("pending");
    expect(result.data).toMatchObject({ status: "awaiting_confirmation" });
  });
});
