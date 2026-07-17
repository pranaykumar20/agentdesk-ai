import type { OrgContext } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { executeAvaTool } from "./tools";
import type { AvaCitation } from "./citations";
import { mergeCitations, citationsForPathname } from "./citations";

export type FallbackAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  model: "fallback-template";
};

function normalizeQuestion(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\s+/g, " ");
}

function match(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function denied(
  pageCitations: AvaCitation[],
  message: string,
): FallbackAnswer {
  return {
    model: "fallback-template",
    toolsUsed: [],
    citations: pageCitations,
    reply: message,
  };
}

/**
 * Answer common account questions from tools without an LLM.
 * Prefer this over "agent unavailable" whenever we have org data.
 */
export async function tryTemplateFallback(
  ctx: OrgContext,
  userMessage: string,
  pathname?: string | null,
): Promise<FallbackAnswer | null> {
  const q = normalizeQuestion(userMessage);
  const pageCitations = citationsForPathname(pathname);

  const wantsCallBreakdown = match(q, [
    /missed.*answered|answered.*missed/,
    /how many (were )?(answered|missed|voicemail)/,
    /\b(answered|missed|voicemail) (vs|versus|and|or) (answered|missed|voicemail)/,
    /call (breakdown|split|distribution|outcomes?)/,
  ]);

  const wantsCallTotals = match(q, [
    /how many (total )?calls/,
    /total calls/,
    /call (count|volume|totals?)/,
    /\bmy calls\b/,
  ]);

  if (wantsCallTotals || wantsCallBreakdown) {
    if (!can(ctx.role, "read", "calls") && !can(ctx.role, "read", "analytics")) {
      return denied(
        pageCitations,
        "You don’t have permission to view call metrics. Ask an admin, or open **/dashboard/calls** if you gain access.",
      );
    }
    const result = await executeAvaTool(ctx, "get_dashboard_metrics", {});
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["get_dashboard_metrics"],
        citations: mergeCitations([...pageCitations, ...result.citations]),
        reply:
          "I couldn’t load call metrics from your account right now. Open **/dashboard/calls** to see answered, missed, and voicemail totals.",
      };
    }
    const m = result.data as {
      totalCalls: number;
      answeredCalls: number;
      missedCalls: number;
      voicemails: number;
    };
    const reply = wantsCallBreakdown
      ? [
          "Here’s your call breakdown from account records:",
          "",
          `- **Answered:** ${m.answeredCalls.toLocaleString()}`,
          `- **Missed:** ${m.missedCalls.toLocaleString()}`,
          `- **Voicemail:** ${m.voicemails.toLocaleString()}`,
          `- **Total:** ${m.totalCalls.toLocaleString()}`,
          "",
          "Full history: **/dashboard/calls**.",
        ].join("\n")
      : [
          "Here are your exact call metrics from the account records:",
          "",
          `- **Total calls:** ${m.totalCalls.toLocaleString()}`,
          `- **Answered:** ${m.answeredCalls.toLocaleString()}`,
          `- **Missed:** ${m.missedCalls.toLocaleString()}`,
          `- **Voicemail:** ${m.voicemails.toLocaleString()}`,
          "",
          "Open **/dashboard/calls** for the full history.",
        ].join("\n");

    return {
      model: "fallback-template",
      toolsUsed: ["get_dashboard_metrics"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply,
    };
  }

  if (
    match(q, [
      /how many appointments/,
      /appointments? (do i have|booked|scheduled|upcoming)/,
      /\b(my )?appointments?\b/,
      /bookings? (do i have|count|total)/,
    ])
  ) {
    if (!can(ctx.role, "read", "appointments")) {
      return denied(
        pageCitations,
        "You don’t have permission to view appointments. Ask an admin, or open **/dashboard/appointments** if allowed.",
      );
    }
    const result = await executeAvaTool(ctx, "list_appointments", { limit: 5 });
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["list_appointments"],
        citations: mergeCitations([
          ...pageCitations,
          ...result.citations,
          { label: "Appointments", path: "/dashboard/appointments" },
        ]),
        reply:
          "I couldn’t load appointment counts from your account right now. Open **/dashboard/appointments** to see booked and upcoming appointments.",
      };
    }
    const data = result.data as {
      metrics: { total: number; confirmed: number; pending: number; cancelled: number };
      upcoming: Array<{ contactName: string; serviceName: string; startsAt: string; status: string }>;
    };
    const upcomingLines =
      data.upcoming.length > 0
        ? data.upcoming
            .slice(0, 5)
            .map(
              (a) =>
                `- **${a.contactName}** — ${a.serviceName} (${a.status}) · ${new Date(a.startsAt).toLocaleString()}`,
            )
        : ["- No upcoming appointments in the current list."];

    return {
      model: "fallback-template",
      toolsUsed: ["list_appointments"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply: [
        `You have **${data.metrics.total.toLocaleString()}** appointments on record:`,
        "",
        `- **Confirmed:** ${data.metrics.confirmed.toLocaleString()}`,
        `- **Pending:** ${data.metrics.pending.toLocaleString()}`,
        `- **Cancelled / no-show:** ${data.metrics.cancelled.toLocaleString()}`,
        "",
        "**Upcoming:**",
        ...upcomingLines,
        "",
        "See all at **/dashboard/appointments**.",
      ].join("\n"),
    };
  }

  if (match(q, [/plan usage/, /minutes (used|left|remaining)/, /what(?:'s| is) my plan/, /billing usage/])) {
    if (!can(ctx.role, "read", "billing")) {
      return denied(
        pageCitations,
        "You don’t have permission to view billing usage. Ask an owner/admin, or visit **/dashboard/billing** if allowed.",
      );
    }
    const result = await executeAvaTool(ctx, "get_billing_usage", {});
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["get_billing_usage"],
        citations: mergeCitations([...pageCitations, ...result.citations]),
        reply: "I couldn’t load billing usage from your account. Open **/dashboard/billing** to see plan and minutes.",
      };
    }
    const u = result.data as {
      planName: string;
      status: string;
      minutesUsed: number;
      minutesIncluded: number;
      usagePct: number;
    };
    return {
      model: "fallback-template",
      toolsUsed: ["get_billing_usage"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply: [
        `You're on the **${u.planName}** plan (${u.status}).`,
        "",
        `- **Minutes used:** ${u.minutesUsed.toLocaleString()} / ${u.minutesIncluded.toLocaleString()} (${u.usagePct}%)`,
        "",
        "Details: **/dashboard/billing**.",
      ].join("\n"),
    };
  }

  if (match(q, [/list (my )?ai employees/, /which ai employees/, /ai employees (do i have|list)/])) {
    if (!can(ctx.role, "read", "agents")) {
      return denied(pageCitations, "You don’t have permission to view AI employees.");
    }
    const result = await executeAvaTool(ctx, "list_ai_employees", {});
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["list_ai_employees"],
        citations: mergeCitations([...pageCitations, ...result.citations]),
        reply: "I couldn’t load AI employees from your account. Open **/dashboard/ai-employees**.",
      };
    }
    const data = result.data as {
      metrics: { total: number; published: number; draft: number };
      employees: Array<{ name: string; roleTitle: string; lifecycleStatus: string }>;
    };
    const lines = data.employees
      .slice(0, 12)
      .map((e) => `- **${e.name}** — ${e.roleTitle} (${e.lifecycleStatus})`);
    return {
      model: "fallback-template",
      toolsUsed: ["list_ai_employees"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply: [
        `You have **${data.metrics.total}** AI employees (**${data.metrics.published}** published, **${data.metrics.draft}** draft):`,
        "",
        ...lines,
        "",
        "Manage them at **/dashboard/ai-employees**.",
      ].join("\n"),
    };
  }

  if (
    match(q, [
      /who'?s on (my |the )?team/,
      /who is on (my |the )?team/,
      /list (my )?team/,
      /show (my )?team/,
      /team (members|roster|list)/,
      /\bmy team\b/,
    ])
  ) {
    if (!can(ctx.role, "read", "members")) {
      return denied(pageCitations, "You don’t have permission to view the team roster.");
    }
    const wantsEmail = /\bemails?\b/.test(q);
    const result = await executeAvaTool(ctx, "list_team_members", {
      includeEmails: wantsEmail,
    });
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["list_team_members"],
        citations: mergeCitations([...pageCitations, ...result.citations]),
        reply: "I couldn’t load team members from your account. Open **/dashboard/team**.",
      };
    }
    const data = result.data as {
      metrics: { total: number; active: number };
      members: Array<{ fullName: string; role: string; status: string; email?: string }>;
    };
    const lines = data.members.map((m) => {
      const email = m.email ? ` · ${m.email}` : "";
      return `- **${m.fullName}** — ${m.role} (${m.status})${email}`;
    });
    return {
      model: "fallback-template",
      toolsUsed: ["list_team_members"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply: [
        `Your team has **${data.metrics.total}** members (**${data.metrics.active}** active):`,
        "",
        ...lines,
        "",
        wantsEmail
          ? "Emails included because you asked for them."
          : "Emails hidden by default — ask if you need them.",
        "",
        "Open **/dashboard/team** to manage invites.",
      ].join("\n"),
    };
  }

  if (match(q, [/\bcrm\b/, /pipeline/, /how many (leads|deals)/, /\bleads?\b/])) {
    if (!can(ctx.role, "read", "crm")) {
      return denied(pageCitations, "You don’t have permission to view CRM data.");
    }
    const result = await executeAvaTool(ctx, "get_crm_summary", {});
    if (!result.ok || !result.data || typeof result.data !== "object") {
      return {
        model: "fallback-template",
        toolsUsed: ["get_crm_summary"],
        citations: mergeCitations([...pageCitations, { label: "CRM", path: "/dashboard/crm" }]),
        reply: "I couldn’t load CRM numbers right now. Open **/dashboard/crm** for your pipeline.",
      };
    }
    const data = result.data as {
      totalDeals: number;
      totalValueCents: number;
      byStage: Array<{ label: string; count: number }>;
    };
    return {
      model: "fallback-template",
      toolsUsed: ["get_crm_summary"],
      citations: mergeCitations([...pageCitations, ...result.citations]),
      reply: [
        `CRM snapshot: **${data.totalDeals}** deals (≈ $${(data.totalValueCents / 100).toLocaleString()}).`,
        "",
        ...data.byStage.map((s) => `- **${s.label}:** ${s.count}`),
        "",
        "Open **/dashboard/crm** for details.",
      ].join("\n"),
    };
  }

  return null;
}

/**
 * When the LLM is down and no specific template matched, still give a useful reply
 * instead of "temporarily unavailable".
 */
export function softUnavailableReply(pathname?: string | null): FallbackAnswer {
  const pageCitations = citationsForPathname(pathname);
  return {
    model: "fallback-template",
    toolsUsed: [],
    citations: pageCitations,
    reply: [
      "I can pull account numbers for calls, appointments, billing, team, AI employees, and CRM — try asking one of those directly.",
      "",
      "Examples:",
      "- How many total calls do I have?",
      "- How many appointments do I have booked?",
      "- How many were missed vs answered?",
      "- What’s my plan usage?",
      "",
      "Or open the matching page in the sidebar (**Calls**, **Appointments**, **Billing**, **Team**).",
    ].join("\n"),
  };
}
