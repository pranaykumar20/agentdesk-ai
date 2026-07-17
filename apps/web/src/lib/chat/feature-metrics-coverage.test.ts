import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";

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

describe("cross-feature exact metric coverage", () => {
  it("answers SMS response rate as 6.3% on SMS page (not WhatsApp 18.7%)", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What's the Response Rate?",
      "/dashboard/sms-campaigns",
    );
    expect(answer!.reply).toMatch(/6\.3%/);
    expect(answer!.reply).not.toMatch(/18\.7%/);
    expect(answer!.sections).toContain("sms");
  });

  it("answers WhatsApp response rate on WhatsApp page", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What's the Response Rate?",
      "/dashboard/whatsapp",
    );
    expect(answer!.reply).toMatch(/18\.7%/);
    expect(answer!.sections).toContain("whatsapp");
  });

  it("answers SMS delivery rate and opt-outs", async () => {
    const delivery = await answerAccountQuestion(
      makeCtx(),
      "What's the Delivery Rate?",
      "/dashboard/sms-campaigns",
    );
    expect(delivery!.reply).toMatch(/98\.7%/);

    const optOuts = await answerAccountQuestion(
      makeCtx(),
      "How many opt-outs?",
      "/dashboard/sms-campaigns",
    );
    expect(optOuts!.reply).toMatch(/\*\*56\*\*/);
  });

  it("answers ROI field-level metrics without full dump only", async () => {
    const ai = await answerAccountQuestion(
      makeCtx(),
      "What's AI Attributed Revenue?",
      "/dashboard/revenue",
    );
    expect(ai!.reply).toMatch(/\$28,340/);
    expect(ai!.reply).not.toMatch(/Revenue & ROI snapshot/i);

    const profit = await answerAccountQuestion(
      makeCtx(),
      "What's Gross Profit?",
      "/dashboard/revenue",
    );
    expect(profit!.reply).toMatch(/\$33,933/);

    const cpa = await answerAccountQuestion(
      makeCtx(),
      "Cost per acquisition?",
      "/dashboard/revenue",
    );
    expect(cpa!.reply).toMatch(/\$28/);
  });

  it("answers Contact Center open / new today / resolutions", async () => {
    const open = await answerAccountQuestion(
      makeCtx(),
      "How many open conversations?",
      "/dashboard/contact-center",
    );
    expect(open!.reply).toMatch(/\*\*32\*\*/);

    const neu = await answerAccountQuestion(
      makeCtx(),
      "How many new today?",
      "/dashboard/contact-center",
    );
    expect(neu!.reply).toMatch(/\*\*48\*\*/);

    const resolved = await answerAccountQuestion(
      makeCtx(),
      "Resolutions today?",
      "/dashboard/contact-center",
    );
    expect(resolved!.reply).toMatch(/\*\*27\*\*/);
  });

  it("answers CRM open tasks and pipeline value", async () => {
    const tasks = await answerAccountQuestion(
      makeCtx(),
      "How many open tasks?",
      "/dashboard/crm",
    );
    expect(tasks!.reply).toMatch(/\*\*3\*\*/);
    expect(tasks!.reply).toMatch(/David Wilson|Lisa Thomas|Maria Garcia/i);

    const pipeline = await answerAccountQuestion(
      makeCtx(),
      "What's the pipeline value?",
      "/dashboard/crm",
    );
    expect(pipeline!.reply).toMatch(/\$13,650/);
  });

  it("answers Live Monitor ringing and live call list", async () => {
    const ringing = await answerAccountQuestion(
      makeCtx(),
      "How many ringing?",
      "/dashboard/live-monitor",
    );
    expect(ringing!.reply).toMatch(/\*\*1\*\*/);

    const who = await answerAccountQuestion(
      makeCtx(),
      "Who's on a live call?",
      "/dashboard/live-monitor",
    );
    expect(who!.reply).toMatch(/Emily Carter/i);
    expect(who!.reply).toMatch(/James Nguyen/i);
  });

  it("answers Training model accuracy", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What's the model accuracy?",
      "/dashboard/training",
    );
    expect(answer!.reply).toMatch(/92\.6%/);
  });

  it("answers Call Queues aggregate avg wait and abandoned", async () => {
    const wait = await answerAccountQuestion(
      makeCtx(),
      "What's the avg wait?",
      "/dashboard/call-queues",
    );
    expect(wait!.reply).toMatch(/2m 34s/);

    const abandoned = await answerAccountQuestion(
      makeCtx(),
      "How many abandoned calls?",
      "/dashboard/call-queues",
    );
    expect(abandoned!.reply).toMatch(/abandoned/i);
  });

  it("answers billing overage", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What's our overage?",
      "/dashboard/billing",
    );
    expect(answer!.reply).toMatch(/no overage|0/i);
  });

  it("lists integrations that need attention", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Which integrations need attention?",
      "/dashboard/integrations",
    );
    expect(answer!.reply).toMatch(/Slack|needs_attention|need attention/i);
  });

  it("answers AI employees average performance", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "What's the average performance?",
      "/dashboard/ai-employees",
    );
    expect(answer!.reply).toMatch(/91\.9|average performance/i);
  });
});
