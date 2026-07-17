import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";
import {
  extractAttribute,
  extractEntityNameCandidate,
  lookupEntity,
} from "./entity-lookup";
import { classifyAvaIntent, looksLikeRecordOrAttributeQuestion } from "./intent";

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

describe("call record extraction", () => {
  it("extracts Sarah Johnson and call duration", () => {
    const q = "What is the call duration of this Sarah Johnson?";
    expect(extractEntityNameCandidate(q)?.toLowerCase()).toBe("sarah johnson");
    expect(extractAttribute(q)?.key).toBe("durationLabel");
  });

  it("classifies call-duration asks as record_attribute, not module summary", () => {
    const q = "What is the call duration of this Sarah Johnson?";
    expect(looksLikeRecordOrAttributeQuestion(q)).toBe(true);
    expect(classifyAvaIntent(q).kind).toBe("record_attribute");
    expect(classifyAvaIntent(q).section).toBe("calls");
    expect(classifyAvaIntent("what are workflows?").kind).toBe("concept");
  });
});

describe("Sarah Johnson call answers", () => {
  it("answers call duration without location matches", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What is the call duration of Sarah Johnson?",
      "/dashboard/calls",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/01:33/);
    expect(answer!.reply).toMatch(/Sarah Johnson/i);
    expect(answer!.reply).not.toMatch(/Downtown Cincinnati|West Chester/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });

  it("uses page context for this Sarah Johnson", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What is the call duration of this Sarah Johnson?",
      "/dashboard/calls",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/01:33/);
    expect(answer!.reply).not.toMatch(/Location/i);
  });

  it("answers who handled the call", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Who handled Sarah Johnson’s call?",
      "/dashboard/calls",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/AI Agent - Ava/i);
  });

  it("answers disposition", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What was Sarah Johnson’s disposition?",
      "/dashboard/calls",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Office Hours/i);
  });

  it("answers when she called", async () => {
    const answer = await lookupEntity(makeCtx(), "When did Sarah Johnson call?", {
      pathname: "/dashboard/calls",
    });
    expect(answer).not.toBeNull();
    expect(answer!.entity?.type).toBe("call");
    expect(answer!.reply).toMatch(/Sarah Johnson/i);
    expect(answer!.reply).toMatch(/\d{4}|\d{1,2}:\d{2}|AM|PM|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
  });

  it("follow-up: how long was it?", async () => {
    const prior = [
      { role: "user" as const, content: "Tell me about Sarah Johnson’s call." },
      {
        role: "assistant" as const,
        content:
          "**Sarah Johnson**’s call was **Answered** by **AI Agent - Ava** on **Jul 17, 2026, 1:14 PM**.\n\nThe call lasted **01:33** and was categorized as **Office Hours**.\n\nOpen **/dashboard/calls** for the full record.",
      },
    ];
    const answer = await answerAccountQuestion(
      makeCtx(),
      "How long was it?",
      "/dashboard/calls",
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/01:33/);
  });

  it("follow-up: who handled it?", async () => {
    const prior = [
      { role: "user" as const, content: "Tell me about Sarah Johnson’s call." },
      {
        role: "assistant" as const,
        content:
          "**Sarah Johnson**’s call was **Answered** by **AI Agent - Ava**.\n\nOpen **/dashboard/calls**.",
      },
    ];
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Who handled it?",
      "/dashboard/calls",
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/AI Agent - Ava/i);
  });

  it("lookupEntity types the record as call", async () => {
    const hit = await lookupEntity(
      makeCtx(),
      "What is the call duration of this Sarah Johnson?",
      { pathname: "/dashboard/calls" },
    );
    expect(hit?.entity?.type).toBe("call");
    expect(hit?.attribute).toBe("durationLabel");
  });
});
