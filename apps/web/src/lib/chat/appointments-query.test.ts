import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";
import { classifyAvaIntent, looksLikeFilteredDataQuestion } from "./intent";
import { buildAvaQueryPlan } from "./query-planner";
import { buildConversationContext } from "./conversation-context";

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

describe("Ava appointment exact answers", () => {
  it("classifies cancelled count as metric_count, not summary", () => {
    const q = "How many Appointments were cancelled?";
    expect(looksLikeFilteredDataQuestion(q)).toBe(true);
    expect(classifyAvaIntent(q).kind).toBe("metric_count");
    expect(classifyAvaIntent(q).section).toBe("appointments");
    const plan = buildAvaQueryPlan(classifyAvaIntent(q), q);
    expect(plan.op).toBe("count");
  });

  it("answers cancelled appointment count directly as 5", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "How many Appointments were cancelled?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/\*\*5\*\*/);
    expect(answer!.reply).toMatch(/cancelled or marked no-show/i);
    expect(answer!.reply).not.toMatch(/Confirmed\s*\*?\*?15/i);
    expect(answer!.reply).not.toMatch(/You have \*\*24\*\* appointments/i);
  });

  it("lists pending appointments without the full module dump", async () => {
    const q = "Give me the Pending list of Appointments?";
    expect(classifyAvaIntent(q).kind).toBe("filtered_list");
    const answer = await answerAccountQuestion(makeCtx(), q);
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/pending appointment/i);
    expect(answer!.reply).toMatch(/\*\*4 pending/i);
    expect(answer!.reply).toMatch(/John Smith|Sarah Johnson|Michael Brown|Emily Davis|David Wilson/);
    expect(answer!.reply).toMatch(/\/dashboard\/appointments/);
    expect(answer!.reply).not.toMatch(/Confirmed:\s*\*\*15\*\*/i);
  });

  it("shows cancelled appointments as a filtered list", async () => {
    const answer = await answerAccountQuestion(makeCtx(), "Show cancelled appointments.");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/cancelled|no-show/i);
    expect(answer!.reply).toMatch(/1\.\s+\*\*/);
    expect(answer!.reply).not.toMatch(/You have \*\*24\*\*/i);
  });

  it("answers confirmed appointment count", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "How many appointments are confirmed?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/\*\*15\*\*/);
    expect(answer!.reply).toMatch(/confirmed/i);
  });

  it("answers which appointment is next from prior pending list context", async () => {
    const prior = [
      { role: "user" as const, content: "Give me the Pending list of Appointments?" },
      {
        role: "assistant" as const,
        content:
          "You have **4 pending appointments**:\n\n1. **John Smith** — Teeth Cleaning — Jul 15, 2026, 9:00 AM\n\nOpen **/dashboard/appointments**.",
      },
    ];
    const conv = buildConversationContext(prior);
    expect(conv.lastSection).toBe("appointments");
    expect(conv.lastFilterStatus).toBeTruthy();

    const answer = await answerAccountQuestion(
      makeCtx(),
      "Which one is next?",
      "/dashboard/appointments",
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/next/i);
    expect(answer!.reply).toMatch(/appointment/i);
    expect(answer!.reply).toMatch(/\*\*[^*]+\*\*/);
  });
});
