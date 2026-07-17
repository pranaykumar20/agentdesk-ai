import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";
import { buildConversationContext } from "./conversation-context";
import { classifyAvaIntent, isModuleNamePhrase } from "./intent";
import { extractEntityNameCandidate } from "./entity-lookup";

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

describe("module name guards", () => {
  it("treats workflows/locations as modules not entities", () => {
    expect(isModuleNamePhrase("workflows")).toBe(true);
    expect(isModuleNamePhrase("the workflows")).toBe(true);
    expect(isModuleNamePhrase("Dental Support")).toBe(false);
    expect(extractEntityNameCandidate("tell me about the workflows")).toBeNull();
    expect(extractEntityNameCandidate("tell me about Dental Support")?.toLowerCase()).toContain(
      "dental support",
    );
  });
});

describe("classifyAvaIntent", () => {
  it("classifies concept, module summary, and build help", () => {
    expect(classifyAvaIntent("what are workflows?").kind).toBe("concept");
    expect(classifyAvaIntent("tell me about the workflows?").kind).toBe("module_summary");
    expect(classifyAvaIntent("Please help me in building this new workflow?").kind).toBe(
      "build_help",
    );
  });

  it("classifies diagnostic and optimize intents", () => {
    expect(
      classifyAvaIntent("Why does Dental Support have 6 agents out of 8?").kind,
    ).toBe("diagnostic");
    expect(classifyAvaIntent("why is service level low?").kind).toBe("diagnostic");
    expect(classifyAvaIntent("How can we improve it to reach 100%?").kind).toBe("optimize");
  });
});

describe("Ava multi-turn workflows + queue reasoning", () => {
  it("explains workflows instead of entity-not-found", async () => {
    const answer = await answerAccountQuestion(makeCtx(), "what are workflows?");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/automation|trigger|workflow/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
    expect(answer!.reply).toMatch(/\/dashboard\/workflows/);
  });

  it("summarizes workflows module on follow-up phrasing", async () => {
    const answer = await answerAccountQuestion(makeCtx(), "tell me about the workflows?");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/workflow/i);
    expect(answer!.reply).toMatch(/In your account|published|draft|total/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find \*\*workflows\*\*/i);
  });

  it("explains Missed Call Follow-up with real description (not missing-field)", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "tell me about Missed Call Follow-up",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Missed Call Follow-up/i);
    expect(answer!.reply).toMatch(/SMS|CRM|missed/i);
    expect(answer!.reply).toMatch(/published/i);
    expect(answer!.reply).not.toMatch(/doesn'?t have a stored \*\*description\*\* field/i);
  });

  it("lists the published workflows by name on inventory follow-up", async () => {
    expect(classifyAvaIntent("what are the 2 published workflows we have?").kind).toBe(
      "filtered_list",
    );
    const answer = await answerAccountQuestion(
      makeCtx(),
      "what are the 2 published workflows we have?",
      null,
      [
        { role: "user", content: "what are workflows?" },
        {
          role: "assistant",
          content: "Workflows are automations...\n\nIn your account: Workflows — 3 total.",
        },
      ],
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Missed Call Follow-up/i);
    expect(answer!.reply).toMatch(/Insurance Lead Capture/i);
    expect(answer!.reply).not.toMatch(/What you can do:/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });

  it("guides building a workflow instead of repeating bare metrics only", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Please help me in building this new workflow?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Missed call follow-up|Appointment confirmation|template/i);
    expect(answer!.reply).toMatch(/\/dashboard\/workflows/);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });

  it("guides building a similar workflow from prior Missed Call Follow-up context", async () => {
    expect(
      classifyAvaIntent("help me in building a similar workflow", {
        lastEntityName: "Missed Call Follow-up",
        lastEntityType: "Workflow",
        lastSection: "workflows",
        lastMetric: null,
        lastPath: "/dashboard/workflows",
        lastIntent: "entity_lookup",
        lastQueryOp: null,
        lastFilterStatus: null,
        lastPage: "/dashboard/workflows",
      }).kind,
    ).toBe("build_help");

    const answer = await answerAccountQuestion(
      makeCtx(),
      "help me in building a similar workflow",
      null,
      [
        { role: "user", content: "tell me about Missed Call Follow-up" },
        {
          role: "assistant",
          content:
            "**Missed Call Follow-up** — Workflow\n\nSMS + CRM task when a call is missed during business hours.\n\n- **Status:** published\n- **Steps:** Missed Call → Send SMS → Create Task\n\nOpen **/dashboard/workflows**.",
        },
      ],
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/similar workflow/i);
    expect(answer!.reply).toMatch(/Missed Call Follow-up/i);
    expect(answer!.reply).toMatch(/Build it like this|duplicate|create a new workflow/i);
    expect(answer!.reply).not.toMatch(/Insurance Lead Capture/i);
    expect(answer!.reply).not.toMatch(/Workflows: \*\*3\*\* total/i);
  });

  it("answers Dental Support entity card", async () => {
    const answer = await answerAccountQuestion(makeCtx(), "tell me about Dental Support");
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Dental Support/i);
    expect(answer!.reply).toMatch(/1m 48s|service level|92/i);
  });

  it("explains 6/8 agents with real queue data", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Why does Dental Support have 6 agents out of 8?",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/6 of 8|6\/8/i);
    expect(answer!.reply).toMatch(/offline|unavailable|paused|schedule/i);
    expect(answer!.reply).toMatch(/4/);
    expect(answer!.reply).toMatch(/1m 48s/);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });

  it("explains low service level from stored metrics", async () => {
    const prior = [
      { role: "user" as const, content: "tell me about Dental Support" },
      {
        role: "assistant" as const,
        content:
          "**Dental Support** — Call Queue\n\n- **Service Level:** 92\n\nOpen **/dashboard/call-queues** for the full record.",
      },
    ];
    const answer = await answerAccountQuestion(
      makeCtx(),
      "why is service level low?",
      null,
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/92%/);
    expect(answer!.reply).toMatch(/4m 10s|abandoned|in queue/i);
    expect(answer!.reply).toMatch(/\/dashboard\/call-queues/);
  });

  it("gives an action plan to reach 100% using follow-up context", async () => {
    const prior = [
      { role: "user" as const, content: "tell me about Dental Support" },
      {
        role: "assistant" as const,
        content:
          "**Dental Support** — Call Queue\n\n- **Agents Online:** 6\n- **Service Level:** 92\n\nOpen **/dashboard/call-queues**.",
      },
      { role: "user" as const, content: "why is service level low?" },
      {
        role: "assistant" as const,
        content: "**Dental Support** is at **92%** service level.",
      },
    ];
    const answer = await answerAccountQuestion(
      makeCtx(),
      "How can we improve it to reach 100%?",
      null,
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/100%|action plan|overflow|callback/i);
    expect(answer!.reply).toMatch(/6\/8|6 of 8|unavailable/i);
    expect(answer!.reply).toMatch(/\/dashboard\/call-queues/);
  });

  it("resolves 'this queue' / staffing follow-up from prior Dental Support", async () => {
    const prior = [
      { role: "user" as const, content: "tell me about Dental Support" },
      {
        role: "assistant" as const,
        content:
          "**Dental Support** — Call Queue\n\n- **Agents Online:** 6\n- **Agents Total:** 8\n\nOpen **/dashboard/call-queues**.",
      },
    ];
    const ctx = buildConversationContext(prior);
    expect(ctx.lastEntityName).toMatch(/Dental Support/i);

    const answer = await answerAccountQuestion(
      makeCtx(),
      "why is this queue 6 out of 8 agents?",
      null,
      prior,
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Dental Support/i);
    expect(answer!.reply).toMatch(/6 of 8|6\/8/i);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
  });
});
