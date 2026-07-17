import { describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/auth";
import type { Organization, OrganizationMember } from "@/types/database";
import { answerAccountQuestion } from "./account-answer";
import {
  answerModuleMetric,
  looksLikeModuleMetricQuestion,
} from "./module-metrics";
import { lookupEntity } from "./entity-lookup";

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

describe("WhatsApp module metrics", () => {
  it("detects response-rate questions as module metrics", () => {
    expect(
      looksLikeModuleMetricQuestion(
        "what is the Response Rate in WhatsApp Automation?",
      ),
    ).toBe(true);
  });

  it("answers WhatsApp Response Rate as 18.7%, not Zapier", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "what is the Response Rate in WhatsApp Automation?",
      "/dashboard/whatsapp",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/18\.7%/);
    expect(answer!.reply).toMatch(/Response Rate/i);
    expect(answer!.reply).not.toMatch(/Zapier/i);
    expect(answer!.sections).toContain("whatsapp");
  });

  it("does not resolve WhatsApp Automation to Zapier integration", async () => {
    const entity = await lookupEntity(
      makeCtx(),
      "what is the Response Rate in WhatsApp Automation?",
    );
    if (entity) {
      expect(entity.reply).not.toMatch(/Zapier/i);
    }
  });
});

describe("Contact Center module metrics", () => {
  it("lists top agents today from Contact Center", async () => {
    const answer = await answerModuleMetric(
      makeCtx(),
      "Who are the Top agents today?",
      "/dashboard/contact-center",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Sarah M\./i);
    expect(answer!.reply).toMatch(/Mike D\./i);
    expect(answer!.sections).toContain("contact_center");
  });

  it("answers top agents via account router without Zapier-style miss", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "who are Top agents today?",
      "/dashboard/contact-center",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Top agents today/i);
    expect(answer!.reply).toMatch(/Sarah M\./i);
    expect(answer!.reply).not.toMatch(/Zapier|Integration/i);
  });
});

describe("Revenue & ROI module metrics", () => {
  it("answers Total Revenue directly as $42,685", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "what is the Total Revenue?",
      "/dashboard/revenue",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/\$42,685/);
    expect(answer!.reply).toMatch(/Total Revenue/i);
    expect(answer!.reply).not.toMatch(/Revenue & ROI snapshot/i);
    expect(answer!.sections).toContain("roi");
  });

  it("lists revenue by source instead of the full snapshot", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "Revenue by source?",
      "/dashboard/revenue",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Revenue by source/i);
    expect(answer!.reply).toMatch(/Phone Calls/i);
    expect(answer!.reply).toMatch(/43\.5%/);
    expect(answer!.reply).toMatch(/Website \/ Chat/i);
    expect(answer!.reply).not.toMatch(/Revenue & ROI snapshot/i);
  });

  it("lists top performing AI agents from Revenue & ROI", async () => {
    const answer = await answerAccountQuestion(
      makeCtx(),
      "who are the Top performing AI agents?",
      "/dashboard/revenue",
    );
    expect(answer).not.toBeNull();
    expect(answer!.reply).toMatch(/Top performing AI agents/i);
    expect(answer!.reply).toMatch(/Receptionist AI/i);
    expect(answer!.reply).toMatch(/Appointment Setter AI/i);
    expect(answer!.reply).toMatch(/\$11,240|\$11240|11,240/);
    expect(answer!.reply).not.toMatch(/couldn'?t find/i);
    expect(answer!.reply).not.toMatch(/Sarah M\./i);
  });
});
