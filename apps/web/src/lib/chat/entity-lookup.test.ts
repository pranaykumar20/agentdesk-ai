import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";
import {
  extractAttribute,
  extractEntityNameCandidate,
  isReferentialFollowUp,
  lookupEntity,
  resolvePriorEntityName,
} from "./entity-lookup";

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

describe("entity extraction", () => {
  it("extracts avg wait attribute and Dental Support name", () => {
    const q = "what is the avg wait in the Dental Support?";
    expect(extractAttribute(q)?.key).toBe("avgWaitLabel");
    expect(extractEntityNameCandidate(q)?.toLowerCase()).toContain("dental support");
  });
});

describe("lookupEntity", () => {
  it("answers Dental Support avg wait with queue-specific value", async () => {
    const answer = await lookupEntity(
      makeCtx(),
      "what is the avg wait in the Dental Support?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/1m 48s/);
    expect(answer!.reply).not.toMatch(/2m 34s/);
    expect(answer!.entity?.type).toBe("call_queue");
  });

  it("answers Appointment Reminder Bot card", async () => {
    const answer = await lookupEntity(makeCtx(), "tell me Appointment Reminder Bot?");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Appointment Reminder Bot/i);
    expect(answer!.reply).toMatch(/Scheduling|SMS|reminder|\$29/i);
    expect(answer!.entity?.type).toBe("marketplace_agent");
  });

  it("answers Dental FAQ Training details", async () => {
    const answer = await lookupEntity(makeCtx(), "Dental FAQ Training");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Dental FAQ Training/i);
    expect(answer!.reply).toMatch(/94\.8/);
    expect(answer!.entity?.type).toBe("training_job");
  });
});

describe("answerAccountQuestion entity priority", () => {
  it("does not dump appointments for Appointment Reminder Bot", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "tell me Appointment Reminder Bot?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Appointment Reminder Bot/i);
    expect(answer!.reply).not.toMatch(/You have \*\*\d+\*\* appointments/i);
  });

  it("still answers inventory appointment counts", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "How many appointments do I have booked?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply.toLowerCase()).toContain("appointment");
  });

  it("does not steal roster / AI employee / plan usage questions", async () => {
    expect(await lookupEntity(makeCtx(), "Who's on my team?")).toBeNull();
    expect(await lookupEntity(makeCtx(), "List my AI employees")).toBeNull();
    expect(await lookupEntity(makeCtx(), "What's my plan usage?")).toBeNull();

    const team = await answerAccountQuestion(makeCtx(), "Who's on my team?");
    expect(team).not.toBeNull();
    expect(team!.reply.toLowerCase()).toMatch(/team|member|owner|agent/);
    expect(team!.reply).not.toMatch(/Couldn't find/i);

    const employees = await answerAccountQuestion(makeCtx(), "List my AI employees");
    expect(employees).not.toBeNull();
    expect(employees!.reply.toLowerCase()).toMatch(/ai employee|receptionist|agent/);

    const usage = await answerAccountQuestion(makeCtx(), "What's my plan usage?");
    expect(usage).not.toBeNull();
    expect(usage!.reply).not.toMatch(/Couldn't find plan usage/i);
  });

  it("resolves follow-up 'what is special about it?' to Noah", async () => {
    expect(isReferentialFollowUp("what is special about it?")).toBe(true);
    expect(extractEntityNameCandidate("what is special about it?")).toBeNull();
    expect(extractAttribute("what is special about it?")?.key).toBe("highlights");

    const priorName = resolvePriorEntityName([
      { role: "user", content: "Noah - Appointment Setter" },
      {
        role: "assistant",
        content:
          "**Noah - Appointment Setter** — AI Employee\n\n- **Status:** published\n\nOpen **/dashboard/ai-employees/agent-noah** for the full record.",
      },
    ]);
    expect(priorName).toBe("Noah - Appointment Setter");

    const answer = await answerAccountQuestion(
      makeCtx(),
      "what is special about it?",
      null,
      [
        { role: "user", content: "Noah - Appointment Setter" },
        {
          role: "assistant",
          content:
            "**Noah - Appointment Setter** — AI Employee\n\n- **Role Title:** Appointment Setter\n\nOpen **/dashboard/ai-employees/agent-noah** for the full record.",
        },
      ],
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Noah - Appointment Setter/i);
    expect(answer!.reply).toMatch(/special|appointment|scheduling|capabilities/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });
});
