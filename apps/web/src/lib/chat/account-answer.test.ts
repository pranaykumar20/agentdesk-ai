import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion, detectAccountSections } from "./account-answer";

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

describe("detectAccountSections", () => {
  it("routes invoices typo and phone numbers", () => {
    expect(detectAccountSections("How many total Invocies do I have?")).toContain("invoices");
    expect(detectAccountSections("How many phone numbers were there?")).toContain(
      "phone_numbers",
    );
  });

  it("routes locations, workflows, integrations", () => {
    expect(detectAccountSections("How many locations do I have?")).toContain("locations");
    expect(detectAccountSections("Show my workflows")).toContain("workflows");
    expect(detectAccountSections("Which integrations are connected?")).toContain(
      "integrations",
    );
  });

  it("routes WhatsApp conversations without contact center", () => {
    const sections = detectAccountSections(
      "How many conversations were there in WhatsAPP?",
    );
    expect(sections).toEqual(["whatsapp"]);
  });
});

describe("answerAccountQuestion end-to-end coverage", () => {
  const cases: Array<{ q: string; expectText: RegExp }> = [
    { q: "How many appointments do I have booked?", expectText: /appointment/i },
    { q: "How many were missed vs answered?", expectText: /answered|missed/i },
    { q: "How many phone numbers were there?", expectText: /phone number/i },
    { q: "How many total Invocies do I have?", expectText: /invoice/i },
    { q: "How many locations do I have?", expectText: /location/i },
    { q: "List my integrations", expectText: /integration/i },
    { q: "How many workflows do I have?", expectText: /workflow/i },
    { q: "What's in my knowledge base?", expectText: /knowledge|document/i },
    { q: "Show my routing rules", expectText: /routing/i },
    { q: "What's my account overview?", expectText: /account overview|calls/i },
    {
      q: "How many conversations were there in WhatsAPP?",
      expectText: /whatsapp conversation/i,
    },
  ];

  for (const { q, expectText } of cases) {
    it(`answers: ${q}`, async () => {
      const answer = await answerAccountQuestion(makeCtx(), q);
      expect(answer).not.toBeNull();
      expect(answer!.reply).toMatch(expectText);
      expect(answer!.reply.trim().length).toBeGreaterThan(20);
    });
  }
});
