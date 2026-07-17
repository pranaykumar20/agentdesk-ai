import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { extractContactLookup, lookupContact } from "./contact-lookup";

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

describe("extractContactLookup", () => {
  it("extracts name from phone-of questions", () => {
    expect(extractContactLookup("what is the phone number of Noah Patel?")?.name).toBe(
      "noah patel",
    );
    expect(
      extractContactLookup("what is the WhatsApp phone number of Noah Patel?")?.preferChannel,
    ).toBe("whatsapp");
  });

  it("does not treat inventory questions as contact lookups", () => {
    expect(extractContactLookup("How many phone numbers do I have?")).toBeNull();
  });
});

describe("lookupContact", () => {
  it("returns Noah Patel WhatsApp phone", async () => {
    const answer = await lookupContact(
      makeCtx(),
      "what is the WhatsApp phone number of Noah Patel?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Noah Patel/i);
    expect(answer!.reply).toMatch(/0144|•••• 0144|\(513\)/);
    expect(answer!.hits.some((h) => h.source === "whatsapp" && h.phone)).toBe(true);
  });
});
