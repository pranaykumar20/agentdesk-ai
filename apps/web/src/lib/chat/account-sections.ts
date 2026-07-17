import type { OrgContext } from "@/lib/auth";
import { can, type Resource } from "@/lib/permissions";
import { getExactDashboardMetrics } from "@/modules/analytics/exact-metrics";
import { getAiEmployeeMetrics, listAiEmployees } from "@/modules/agents/data";
import {
  getAppointmentMetrics,
  getUpcomingAppointments,
} from "@/modules/appointments/data";
import { getUsageSnapshot, listInvoices } from "@/modules/billing/data";
import { getCallQueueSummary, listCallQueues } from "@/modules/call-queues/data";
import { listCalls } from "@/modules/calls/data";
import { getContactCenterSummary } from "@/modules/contact-center/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { getIntegrationMetrics, listIntegrations } from "@/modules/integrations/data";
import { getKnowledgeMetrics } from "@/modules/knowledge/data";
import { getLiveMonitorSummary } from "@/modules/live-monitor/data";
import { getLocationMetrics, listLocations } from "@/modules/locations/data";
import { getPhoneMetrics, listPhoneNumbers } from "@/modules/phone-numbers/data";
import { getRoiSummary } from "@/modules/roi/data";
import { listRoutingRules } from "@/modules/routing/data";
import { getGeneralSettings } from "@/modules/settings/data";
import { getSmsCampaignSummary } from "@/modules/sms-campaigns/data";
import { getTeamMetrics, listTeamMembers } from "@/modules/team/data";
import { getTrainingSummary } from "@/modules/training/data";
import { getVoiceFlowMetrics, listVoiceFlows } from "@/modules/voice-flows/data";
import { getWhatsappSummary } from "@/modules/whatsapp/data";
import { getWorkflowMetrics, listWorkflows } from "@/modules/workflows/data";
import { maskPhone } from "./account-context";
import type { AvaCitation } from "./citations";

export const ACCOUNT_SECTIONS = [
  "overview",
  "calls",
  "appointments",
  "billing",
  "invoices",
  "phone_numbers",
  "ai_employees",
  "team",
  "crm",
  "integrations",
  "knowledge",
  "locations",
  "workflows",
  "voice_flows",
  "contact_center",
  "live_monitor",
  "call_queues",
  "sms",
  "whatsapp",
  "training",
  "roi",
  "routing",
  "settings",
] as const;

export type AccountSectionId = (typeof ACCOUNT_SECTIONS)[number];

type SectionMeta = {
  id: AccountSectionId;
  resource: Resource | null;
  label: string;
  path: string;
  keywords: string[];
};

export const SECTION_META: SectionMeta[] = [
  {
    id: "overview",
    resource: "analytics",
    label: "Dashboard",
    path: "/dashboard",
    keywords: ["overview", "dashboard", "summary", "kpi", "metrics", "how is my account"],
  },
  {
    id: "calls",
    resource: "calls",
    label: "Calls",
    path: "/dashboard/calls",
    keywords: [
      "call",
      "calls",
      "answered",
      "missed",
      "voicemail",
      "voicemails",
      "phone call",
    ],
  },
  {
    id: "appointments",
    resource: "appointments",
    label: "Appointments",
    path: "/dashboard/appointments",
    keywords: ["appointment", "appointments", "booking", "bookings", "scheduled", "calendar"],
  },
  {
    id: "billing",
    resource: "billing",
    label: "Billing",
    path: "/dashboard/billing",
    keywords: ["billing", "plan", "subscription", "minutes", "usage", "overage"],
  },
  {
    id: "invoices",
    resource: "billing",
    label: "Billing",
    path: "/dashboard/billing",
    keywords: ["invoice", "invoices", "invocie", "invocies", "receipt", "receipts"],
  },
  {
    id: "phone_numbers",
    resource: "phone_numbers",
    label: "Phone Numbers",
    path: "/dashboard/phone-numbers",
    keywords: ["phone number", "phone numbers", "numbers", "lines", "twilio number"],
  },
  {
    id: "ai_employees",
    resource: "agents",
    label: "AI Employees",
    path: "/dashboard/ai-employees",
    keywords: ["ai employee", "ai employees", "agent", "agents", "receptionist ai"],
  },
  {
    id: "team",
    resource: "members",
    label: "Team",
    path: "/dashboard/team",
    keywords: ["team", "members", "member", "roster", "invite", "staff", "users"],
  },
  {
    id: "crm",
    resource: "crm",
    label: "CRM",
    path: "/dashboard/crm",
    keywords: ["crm", "pipeline", "lead", "leads", "deal", "deals"],
  },
  {
    id: "integrations",
    resource: "integrations",
    label: "Integrations",
    path: "/dashboard/integrations",
    keywords: ["integration", "integrations", "connected", "hubspot", "salesforce", "slack"],
  },
  {
    id: "knowledge",
    resource: "knowledge",
    label: "Knowledge Base",
    path: "/dashboard/knowledge-base",
    keywords: ["knowledge", "knowledge base", "faq", "faqs", "documents", "docs", "articles"],
  },
  {
    id: "locations",
    resource: "locations",
    label: "Locations",
    path: "/dashboard/locations",
    keywords: ["location", "locations", "offices", "branches", "sites"],
  },
  {
    id: "workflows",
    resource: "workflows",
    label: "Workflows",
    path: "/dashboard/workflows",
    keywords: ["workflow", "workflows", "automation", "automations"],
  },
  {
    id: "voice_flows",
    resource: "voice_flows",
    label: "Voice Flows",
    path: "/dashboard/voice-flows",
    keywords: ["voice flow", "voice flows", "ivr", "call flow", "call flows"],
  },
  {
    id: "contact_center",
    resource: "contact_center",
    label: "Contact Center",
    path: "/dashboard/contact-center",
    // Avoid bare "conversations" — that also appears in WhatsApp/SMS questions.
    keywords: [
      "contact center",
      "omnichannel inbox",
      "omnichannel",
      "inbox conversations",
      "top agents",
      "top agent",
      "agents today",
    ],
  },
  {
    id: "live_monitor",
    resource: "live_monitor",
    label: "Live Monitor",
    path: "/dashboard/live-monitor",
    keywords: ["live monitor", "live calls", "active calls", "listening"],
  },
  {
    id: "call_queues",
    resource: "call_queues",
    label: "Call Queues",
    path: "/dashboard/call-queues",
    keywords: ["call queue", "call queues", "queue", "queues"],
  },
  {
    id: "sms",
    resource: "sms_campaigns",
    label: "SMS Campaigns",
    path: "/dashboard/sms-campaigns",
    keywords: ["sms", "text campaign", "text campaigns", "sms campaign", "sms campaigns"],
  },
  {
    id: "whatsapp",
    resource: "whatsapp",
    label: "WhatsApp",
    path: "/dashboard/whatsapp",
    keywords: [
      "whatsapp",
      "whats app",
      "whatsapp automation",
      "wa conversation",
      "wa conversations",
      "response rate",
      "read rate",
    ],
  },
  {
    id: "training",
    resource: "training",
    label: "Training",
    path: "/dashboard/training",
    keywords: ["training", "training center", "coaching"],
  },
  {
    id: "roi",
    resource: "roi",
    label: "Revenue & ROI",
    path: "/dashboard/revenue",
    keywords: [
      "roi",
      "revenue",
      "total revenue",
      "profit",
      "attribution",
      "revenue by source",
      "top performing ai",
      "ai agents revenue",
    ],
  },
  {
    id: "routing",
    resource: "routing",
    label: "Routing Rules",
    path: "/dashboard/routing-rules",
    keywords: ["routing", "routing rules", "route", "rules"],
  },
  {
    id: "settings",
    resource: "settings",
    label: "Settings",
    path: "/dashboard/settings",
    keywords: ["settings", "timezone", "business name", "organization settings", "org settings"],
  },
];

export type SectionFetchResult = {
  section: AccountSectionId;
  ok: boolean;
  denied?: boolean;
  error?: string;
  data?: unknown;
  citations: AvaCitation[];
};

function citationFor(section: AccountSectionId): AvaCitation {
  const meta = SECTION_META.find((m) => m.id === section)!;
  return { label: meta.label, path: meta.path, tool: `section:${section}` };
}

export async function fetchAccountSection(
  ctx: OrgContext,
  section: AccountSectionId,
  opts?: { includeEmails?: boolean },
): Promise<SectionFetchResult> {
  const meta = SECTION_META.find((m) => m.id === section)!;
  const citations = [citationFor(section)];
  if (meta.resource && !can(ctx.role, "read", meta.resource)) {
    // overview can also use calls permission
    if (!(section === "overview" && can(ctx.role, "read", "calls"))) {
      return { section, ok: false, denied: true, citations };
    }
  }

  const orgId = ctx.organization.id;

  try {
    switch (section) {
      case "overview": {
        const metrics = await getExactDashboardMetrics(orgId);
        return { section, ok: true, data: metrics, citations };
      }
      case "calls": {
        const [metrics, recent] = await Promise.all([
          getExactDashboardMetrics(orgId),
          listCalls(orgId, { page: 1, pageSize: 5 }),
        ]);
        return {
          section,
          ok: true,
          data: {
            totalCalls: metrics.totalCalls,
            answeredCalls: metrics.answeredCalls,
            missedCalls: metrics.missedCalls,
            voicemails: metrics.voicemails,
            recent: recent.items.map((c) => ({
              callerName: c.callerName,
              callerPhone: maskPhone(c.callerPhone),
              status: c.status,
              startedAt: c.startedAt,
            })),
          },
          citations,
        };
      }
      case "appointments": {
        const [metrics, upcoming] = await Promise.all([
          getAppointmentMetrics(orgId),
          getUpcomingAppointments(orgId, 5),
        ]);
        return {
          section,
          ok: true,
          data: {
            metrics,
            upcoming: upcoming.map((a) => ({
              contactName: a.contactName,
              serviceName: a.serviceName,
              status: a.status,
              startsAt: a.startsAt,
            })),
          },
          citations,
        };
      }
      case "billing": {
        const usage = await getUsageSnapshot(orgId);
        return { section, ok: true, data: usage, citations };
      }
      case "invoices": {
        const invoices = await listInvoices(orgId);
        return {
          section,
          ok: true,
          data: {
            total: invoices.length,
            paid: invoices.filter((i) => i.status === "paid").length,
            open: invoices.filter((i) => i.status === "open").length,
            draft: invoices.filter((i) => i.status === "draft").length,
            void: invoices.filter((i) => i.status === "void").length,
            recent: invoices.slice(0, 8).map((i) => ({
              number: i.number,
              status: i.status,
              amountUsd: i.amountUsd,
              periodLabel: i.periodLabel,
            })),
          },
          citations,
        };
      }
      case "phone_numbers": {
        const [metrics, numbers] = await Promise.all([
          getPhoneMetrics(orgId),
          listPhoneNumbers(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            metrics,
            numbers: numbers.map((n) => ({
              e164: maskPhone(n.e164),
              friendlyName: n.friendlyName,
              status: n.status,
              assignedTo: n.assignedTo,
            })),
          },
          citations,
        };
      }
      case "ai_employees": {
        const [metrics, employees] = await Promise.all([
          getAiEmployeeMetrics(orgId),
          listAiEmployees(orgId),
        ]);
        return { section, ok: true, data: { metrics, employees }, citations };
      }
      case "team": {
        const includeEmails = Boolean(opts?.includeEmails);
        const [metrics, members] = await Promise.all([
          getTeamMetrics(orgId),
          listTeamMembers(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            metrics,
            members: members.map((m) => ({
              fullName: m.fullName,
              role: m.role,
              status: m.status,
              department: m.department,
              ...(includeEmails ? { email: m.email } : {}),
            })),
            emailsIncluded: includeEmails,
          },
          citations,
        };
      }
      case "crm": {
        const crm = await getCrmPipelineSummary(orgId);
        return {
          section,
          ok: true,
          data: {
            totalDeals: crm.totalDeals,
            totalValueCents: crm.totalValueCents,
            byStage: crm.byStage.map((s) => ({
              id: s.id,
              label: s.label,
              count: s.count,
              valueCents: s.valueCents,
            })),
            tasks: crm.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              dueLabel: t.dueLabel,
              urgency: t.urgency,
            })),
            openTasks: crm.tasks.length,
          },
          citations,
        };
      }
      case "integrations": {
        const [metrics, items] = await Promise.all([
          getIntegrationMetrics(orgId),
          listIntegrations(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            metrics,
            items: items.map((i) => ({ name: i.name, status: i.status, category: i.category })),
          },
          citations,
        };
      }
      case "knowledge": {
        const metrics = await getKnowledgeMetrics(orgId);
        return { section, ok: true, data: metrics, citations };
      }
      case "locations": {
        const [metrics, items] = await Promise.all([
          getLocationMetrics(orgId),
          listLocations(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            metrics,
            items: items.map((l) => ({
              name: l.name,
              city: l.city,
              region: l.region,
              status: l.status,
              phone: maskPhone(l.phone),
            })),
          },
          citations,
        };
      }
      case "workflows": {
        const [metrics, items] = await Promise.all([
          getWorkflowMetrics(orgId),
          listWorkflows(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            ...metrics,
            items: items.map((w) => ({
              name: w.name,
              status: w.status,
              runs: w.runs,
              description: w.description,
            })),
          },
          citations,
        };
      }
      case "voice_flows": {
        const [metrics, items] = await Promise.all([
          getVoiceFlowMetrics(orgId),
          listVoiceFlows(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            ...metrics,
            items: items.map((f) => ({
              name: f.name,
              status: f.status,
              agentName: f.agentName,
              description: f.description,
            })),
          },
          citations,
        };
      }
      case "contact_center": {
        const summary = await getContactCenterSummary(orgId);
        return {
          section,
          ok: true,
          data: {
            metrics: summary.metrics,
            conversationCount: summary.conversations.length,
            queues: summary.queues,
            topAgents: summary.topAgents,
          },
          citations,
        };
      }
      case "live_monitor": {
        const summary = await getLiveMonitorSummary(orgId);
        return {
          section,
          ok: true,
          data: {
            metrics: summary.metrics,
            activeCalls: summary.calls.length,
            calls: summary.calls.slice(0, 10).map((c) => ({
              callerName: c.callerName,
              agentName: c.agentName,
              queueName: c.queueName,
              status: c.status,
              durationLabel: c.durationLabel,
              topic: c.topic,
            })),
          },
          citations,
        };
      }
      case "call_queues": {
        const [summary, queues] = await Promise.all([
          getCallQueueSummary(orgId),
          listCallQueues(orgId),
        ]);
        return {
          section,
          ok: true,
          data: {
            ...summary,
            items: queues.map((q) => ({
              name: q.name,
              status: q.status,
              queueType: q.queueType,
              callsInQueue: q.callsInQueue,
              agentsOnline: q.agentsOnline,
              agentsTotal: q.agentsTotal,
              avgWaitLabel: q.avgWaitLabel,
              serviceLevel: q.serviceLevel,
              abandoned: q.abandoned,
            })),
          },
          citations,
        };
      }
      case "sms": {
        const summary = await getSmsCampaignSummary(orgId);
        return { section, ok: true, data: summary, citations };
      }
      case "whatsapp": {
        const summary = await getWhatsappSummary(orgId);
        return {
          section,
          ok: true,
          data: {
            conversationCount: summary.conversations.length,
            conversations: summary.conversations.slice(0, 8).map((c) => ({
              contactName: c.contactName,
              interest: c.interest,
              status: c.status,
              relativeTime: c.relativeTime,
              lastMessage: c.lastMessage,
            })),
            metrics: summary.metrics,
            workflows: summary.workflows.slice(0, 5),
          },
          citations,
        };
      }
      case "training": {
        const summary = await getTrainingSummary(orgId);
        return { section, ok: true, data: summary, citations };
      }
      case "roi": {
        const summary = await getRoiSummary(orgId);
        return {
          section,
          ok: true,
          data: {
            metrics: summary.metrics,
            sources: summary.sources,
            agents: summary.agents,
            insights: summary.insights.slice(0, 4),
          },
          citations,
        };
      }
      case "routing": {
        const rules = await listRoutingRules(orgId);
        return {
          section,
          ok: true,
          data: {
            total: rules.length,
            active: rules.filter((r) => r.status === "active").length,
            rules: rules.slice(0, 10).map((r) => ({
              name: r.name,
              status: r.status,
              priority: r.priority,
            })),
          },
          citations,
        };
      }
      case "settings": {
        const settings = getGeneralSettings(ctx.organization);
        return {
          section,
          ok: true,
          data: {
            businessName: settings.businessName,
            businessPhone: maskPhone(settings.businessPhone),
            website: settings.website,
            industry: settings.industry,
            timezone: settings.timezone,
            currency: settings.currency,
            language: settings.language,
          },
          citations,
        };
      }
      default:
        return { section, ok: false, error: "Unknown section", citations };
    }
  } catch (error) {
    return {
      section,
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load",
      citations,
    };
  }
}

export function formatSectionReply(result: SectionFetchResult): string {
  const meta = SECTION_META.find((m) => m.id === result.section)!;
  if (result.denied) {
    return `You don’t have permission to view **${meta.label}**. Ask an admin, or open **${meta.path}** if you gain access.`;
  }
  if (!result.ok || result.data == null) {
    return `I couldn’t load **${meta.label}** from your account right now. Open **${meta.path}** to view it directly.`;
  }

  const data = result.data as Record<string, unknown>;

  switch (result.section) {
    case "overview":
    case "calls": {
      const m = data as {
        totalCalls: number;
        answeredCalls: number;
        missedCalls: number;
        voicemails: number;
      };
      return [
        "Here’s your call / dashboard snapshot:",
        "",
        `- **Total calls:** ${m.totalCalls.toLocaleString()}`,
        `- **Answered:** ${m.answeredCalls.toLocaleString()}`,
        `- **Missed:** ${m.missedCalls.toLocaleString()}`,
        `- **Voicemail:** ${m.voicemails.toLocaleString()}`,
        "",
        `Open **${meta.path}** for details.`,
      ].join("\n");
    }
    case "appointments": {
      const metrics = data.metrics as {
        total: number;
        confirmed: number;
        pending: number;
        cancelled: number;
      };
      const upcoming = (data.upcoming as Array<{ contactName: string; serviceName: string; status: string }>) ?? [];
      return [
        `You have **${metrics.total.toLocaleString()}** appointments:`,
        "",
        `- **Confirmed:** ${metrics.confirmed}`,
        `- **Pending:** ${metrics.pending}`,
        `- **Cancelled / no-show:** ${metrics.cancelled}`,
        "",
        "**Upcoming:**",
        ...(upcoming.length
          ? upcoming.map((a) => `- **${a.contactName}** — ${a.serviceName} (${a.status})`)
          : ["- None listed right now."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "billing": {
      const u = data as {
        planName: string;
        status: string;
        minutesUsed: number;
        minutesIncluded: number;
        usagePct: number;
      };
      return [
        `You're on **${u.planName}** (${u.status}).`,
        "",
        `- **Minutes used:** ${u.minutesUsed.toLocaleString()} / ${u.minutesIncluded.toLocaleString()} (${u.usagePct}%)`,
        "",
        `Details: **${meta.path}**.`,
      ].join("\n");
    }
    case "invoices": {
      const inv = data as {
        total: number;
        paid: number;
        open: number;
        draft: number;
        void: number;
        recent: Array<{ number: string; status: string; amountUsd: number; periodLabel: string }>;
      };
      return [
        `You have **${inv.total.toLocaleString()}** invoice${inv.total === 1 ? "" : "s"}:`,
        "",
        `- **Paid:** ${inv.paid}`,
        `- **Open:** ${inv.open}`,
        `- **Draft:** ${inv.draft}`,
        `- **Void:** ${inv.void}`,
        "",
        "**Recent:**",
        ...(inv.recent.length
          ? inv.recent.map(
              (i) => `- **${i.number}** — $${i.amountUsd.toFixed(2)} · ${i.status} · ${i.periodLabel}`,
            )
          : ["- None yet."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "phone_numbers": {
      const metrics = data.metrics as {
        total: number;
        active: number;
        inUse: number;
        forwarding: number;
        unavailable: number;
      };
      const numbers = (data.numbers as Array<{
        friendlyName: string;
        e164: string | null;
        status: string;
        assignedTo?: string | null;
      }>) ?? [];
      return [
        `You have **${metrics.total.toLocaleString()}** phone number${metrics.total === 1 ? "" : "s"}:`,
        "",
        `- **Active:** ${metrics.active}`,
        `- **In use:** ${metrics.inUse}`,
        `- **Forwarding:** ${metrics.forwarding}`,
        `- **Unavailable:** ${metrics.unavailable}`,
        "",
        "**Numbers:**",
        ...(numbers.length
          ? numbers.map(
              (n) =>
                `- **${n.friendlyName}** — ${n.e164 ?? "masked"} (${n.status})${
                  n.assignedTo ? ` · ${n.assignedTo}` : ""
                }`,
            )
          : ["- None yet."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "ai_employees": {
      const metrics = data.metrics as { total: number; published: number; draft: number };
      const employees = (data.employees as Array<{
        name: string;
        roleTitle: string;
        lifecycleStatus: string;
      }>) ?? [];
      return [
        `You have **${metrics.total}** AI employees (**${metrics.published}** published, **${metrics.draft}** draft):`,
        "",
        ...employees.slice(0, 12).map((e) => `- **${e.name}** — ${e.roleTitle} (${e.lifecycleStatus})`),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "team": {
      const metrics = data.metrics as {
        total: number;
        active: number;
        admins?: number;
        managers?: number;
        agents?: number;
      };
      const members = (data.members as Array<{
        fullName: string;
        role: string;
        status: string;
        email?: string;
      }>) ?? [];
      return [
        `Your team has **${metrics.total}** members (**${metrics.active}** active):`,
        "",
        metrics.admins != null ? `- **Admins:** ${metrics.admins}` : null,
        metrics.managers != null ? `- **Managers:** ${metrics.managers}` : null,
        metrics.agents != null ? `- **Agents:** ${metrics.agents}` : null,
        "",
        ...members.map((m) => {
          const email = m.email ? ` · ${m.email}` : "";
          return `- **${m.fullName}** — ${m.role} (${m.status})${email}`;
        }),
        "",
        data.emailsIncluded
          ? "Emails included because you asked for them."
          : "Emails hidden by default — ask if you need them.",
        "",
        `Open **${meta.path}**.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "crm": {
      const crm = data as {
        totalDeals: number;
        totalValueCents: number;
        byStage: Array<{ label: string; count: number }>;
        tasks?: Array<{ title: string; dueLabel: string }>;
        openTasks?: number;
      };
      return [
        `CRM: **${crm.totalDeals}** deals (≈ $${(crm.totalValueCents / 100).toLocaleString()}).`,
        "",
        ...crm.byStage.map((s) => `- **${s.label}:** ${s.count}`),
        "",
        crm.openTasks != null ? `**Open tasks:** ${crm.openTasks}` : null,
        ...(crm.tasks?.length
          ? crm.tasks.map((t) => `- ${t.title} (${t.dueLabel})`)
          : []),
        "",
        `Open **${meta.path}**.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "integrations": {
      const metrics = data.metrics as {
        total: number;
        connected: number;
        needsAttention: number;
        disconnected: number;
      };
      const items = (data.items as Array<{ name: string; status: string }>) ?? [];
      return [
        `Integrations: **${metrics.connected}/${metrics.total}** connected` +
          (metrics.needsAttention ? ` · **${metrics.needsAttention}** need attention` : "") +
          ".",
        "",
        ...items.map((i) => `- **${i.name}** — ${i.status}`),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "knowledge": {
      const k = data as {
        totalArticles: number;
        published: number;
        drafts: number;
        processing: number;
        failed: number;
      };
      return [
        `Knowledge base: **${k.totalArticles}** documents`,
        "",
        `- **Published:** ${k.published}`,
        `- **Drafts:** ${k.drafts}`,
        `- **Processing:** ${k.processing}`,
        `- **Failed:** ${k.failed}`,
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "locations": {
      const metrics = data.metrics as {
        total: number;
        states: number;
        calls: number;
        appointments: number;
        teamMembers: number;
      };
      const items = (data.items as Array<{ name: string; city: string; region: string; status: string }>) ?? [];
      return [
        `You have **${metrics.total}** location${metrics.total === 1 ? "" : "s"} across **${metrics.states}** regions.`,
        "",
        ...items.map((l) => `- **${l.name}** — ${l.city}, ${l.region} (${l.status})`),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "workflows": {
      const m = data as {
        total: number;
        published: number;
        draft: number;
        runs: number;
        items?: Array<{
          name: string;
          status: string;
          runs: number;
          description?: string;
        }>;
      };
      const items = m.items ?? [];
      const published = items.filter((w) => w.status === "published");
      const drafts = items.filter((w) => w.status === "draft");
      return [
        `Workflows: **${m.total}** total (**${m.published}** published, **${m.draft}** draft, **${m.runs.toLocaleString()}** runs).`,
        "",
        published.length
          ? [
              "**Published:**",
              ...published.map(
                (w) =>
                  `- **${w.name}**${w.description ? ` — ${w.description}` : ""} (${w.runs.toLocaleString()} runs)`,
              ),
            ].join("\n")
          : null,
        drafts.length
          ? [
              "",
              "**Draft:**",
              ...drafts.map((w) => `- **${w.name}**${w.description ? ` — ${w.description}` : ""}`),
            ].join("\n")
          : null,
        "",
        `Open **${meta.path}**.`,
      ]
        .filter((line) => line != null)
        .join("\n");
    }
    case "settings": {
      const s = data as {
        businessName: string;
        timezone: string;
        industry: string;
        website: string;
        businessPhone: string | null;
      };
      return [
        "Organization settings:",
        "",
        `- **Business:** ${s.businessName}`,
        `- **Timezone:** ${s.timezone}`,
        `- **Industry:** ${s.industry}`,
        `- **Website:** ${s.website}`,
        `- **Phone:** ${s.businessPhone ?? "—"}`,
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "routing": {
      const r = data as {
        total: number;
        active: number;
        rules: Array<{ name: string; status: string; priority: number }>;
      };
      return [
        `Routing rules: **${r.total}** total (**${r.active}** active).`,
        "",
        ...r.rules.map((rule) => `- **${rule.name}** — ${rule.status} (priority ${rule.priority})`),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "whatsapp": {
      const wa = data as {
        conversationCount: number;
        conversations: Array<{
          contactName: string;
          interest: string;
          status: string;
          relativeTime: string;
          lastMessage?: string;
        }>;
        metrics: {
          messagesSent: number;
          messagesDelivered: number;
          readRate: number;
          responseRate: number;
          activeWorkflows: number;
        };
      };
      return [
        `You have **${wa.conversationCount.toLocaleString()}** WhatsApp conversation${wa.conversationCount === 1 ? "" : "s"}.`,
        "",
        `- **Messages sent:** ${wa.metrics.messagesSent.toLocaleString()}`,
        `- **Delivered:** ${wa.metrics.messagesDelivered.toLocaleString()}`,
        `- **Read rate:** ${wa.metrics.readRate}%`,
        `- **Response rate:** ${wa.metrics.responseRate}%`,
        `- **Active workflows:** ${wa.metrics.activeWorkflows}`,
        "",
        "**Recent conversations:**",
        ...(wa.conversations.length
          ? wa.conversations.map(
              (c) =>
                `- **${c.contactName}** — ${c.interest} (${c.status}) · ${c.relativeTime}`,
            )
          : ["- None right now."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "contact_center": {
      const cc = data as {
        conversationCount: number;
        metrics: {
          open: number;
          newToday: number;
          slaCompliance: number;
          resolutionsToday: number;
          csat: number;
        };
        queues: Array<{ name: string; count: number }>;
        topAgents?: Array<{ name: string; resolutions: number }>;
      };
      return [
        `Contact Center: **${cc.conversationCount.toLocaleString()}** conversations in view.`,
        "",
        `- **Open:** ${cc.metrics.open}`,
        `- **New today:** ${cc.metrics.newToday}`,
        `- **Resolved today:** ${cc.metrics.resolutionsToday}`,
        `- **SLA compliance:** ${cc.metrics.slaCompliance}%`,
        `- **CSAT:** ${cc.metrics.csat}`,
        "",
        "**Top agents today:**",
        ...(cc.topAgents?.length
          ? cc.topAgents.map((a) => `- **${a.name}** — ${a.resolutions} resolutions`)
          : ["- No agent leaderboard data."]),
        "",
        "**Queues:**",
        ...(cc.queues?.length
          ? cc.queues.map((q) => `- **${q.name}:** ${q.count}`)
          : ["- No queue data."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "sms": {
      const sms = data as {
        metrics?: {
          totalCampaigns?: number;
          messagesSent?: number;
          deliveryRate?: number;
          responseRate?: number;
          optOuts?: number;
        };
      };
      const m = sms.metrics ?? {};
      return [
        "SMS campaigns snapshot:",
        "",
        m.totalCampaigns != null ? `- **Total campaigns:** ${m.totalCampaigns}` : null,
        m.messagesSent != null ? `- **Messages sent:** ${m.messagesSent.toLocaleString()}` : null,
        m.deliveryRate != null ? `- **Delivery rate:** ${m.deliveryRate}%` : null,
        m.responseRate != null ? `- **Response rate:** ${m.responseRate}%` : null,
        m.optOuts != null ? `- **Opt-outs:** ${m.optOuts}` : null,
        "",
        `Open **${meta.path}**.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "live_monitor": {
      const lm = data as { activeCalls?: number; metrics?: Record<string, unknown> };
      return [
        `Live monitor: **${lm.activeCalls ?? 0}** active call${(lm.activeCalls ?? 0) === 1 ? "" : "s"}.`,
        "",
        formatCompactMetrics(lm.metrics ?? lm),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "call_queues": {
      const items =
        (
          data as {
            items?: Array<{
              name: string;
              status: string;
              queueType: string;
              callsInQueue: number;
              agentsOnline: number;
              agentsTotal: number;
              avgWaitLabel: string;
              serviceLevel: number;
              abandoned: number;
            }>;
          }
        ).items ?? [];
      return [
        `Call queues: **${items.length}** configured.`,
        "",
        ...(items.length
          ? items.map(
              (q) =>
                `- **${q.name}** (${q.queueType}, ${q.status}) — in queue **${q.callsInQueue}**, agents **${q.agentsOnline}/${q.agentsTotal}**, wait **${q.avgWaitLabel}**, SL **${q.serviceLevel}%**, abandoned **${q.abandoned}**`,
            )
          : ["- No queues found.", "", formatCompactMetrics(data)]),
        "",
        `Open **${meta.path}**. Ask about a specific queue (e.g. Dental Support) for a deeper read.`,
      ].join("\n");
    }
    case "voice_flows": {
      const m = data as {
        total: number;
        published: number;
        draft: number;
        items?: Array<{
          name: string;
          status: string;
          agentName: string;
          description: string;
        }>;
      };
      const items = m.items ?? [];
      return [
        `Voice flows: **${m.total}** total (**${m.published}** published, **${m.draft}** draft).`,
        "",
        ...(items.length
          ? items.map(
              (f) =>
                `- **${f.name}** — ${f.status}${f.agentName ? ` · agent ${f.agentName}` : ""}${f.description ? ` — ${f.description}` : ""}`,
            )
          : ["- No voice flows found."]),
        "",
        `Open **${meta.path}**.`,
      ].join("\n");
    }
    case "training": {
      const metrics = (data.metrics ?? data) as {
        totalTrainings?: number;
        datasets?: number;
        conversationsAnalyzed?: number;
        modelAccuracy?: number;
        evaluationsPassed?: number;
      };
      return [
        "Training Center snapshot:",
        "",
        metrics.modelAccuracy != null ? `- **Model accuracy:** ${metrics.modelAccuracy}%` : null,
        metrics.conversationsAnalyzed != null
          ? `- **Conversations analyzed:** ${metrics.conversationsAnalyzed.toLocaleString()}`
          : null,
        metrics.totalTrainings != null ? `- **Total trainings:** ${metrics.totalTrainings}` : null,
        metrics.datasets != null ? `- **Datasets:** ${metrics.datasets}` : null,
        metrics.evaluationsPassed != null
          ? `- **Evaluations passed:** ${metrics.evaluationsPassed}`
          : null,
        "",
        `Open **${meta.path}**.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "roi": {
      const metrics = data.metrics as {
        totalRevenueCents?: number;
        aiAttributedCents?: number;
        totalCostCents?: number;
        grossProfitCents?: number;
        roiPercent?: number;
        totalCalls?: number;
        appointmentsBooked?: number;
        newPatients?: number;
        conversionRate?: number;
        costPerAcquisitionCents?: number;
      };
      const insights = (data.insights as string[]) ?? [];
      return [
        "Revenue & ROI snapshot:",
        "",
        metrics.totalRevenueCents != null
          ? `- **Revenue:** $${(metrics.totalRevenueCents / 100).toLocaleString()}`
          : null,
        metrics.aiAttributedCents != null
          ? `- **AI attributed:** $${(metrics.aiAttributedCents / 100).toLocaleString()}`
          : null,
        metrics.totalCostCents != null
          ? `- **Total cost:** $${(metrics.totalCostCents / 100).toLocaleString()}`
          : null,
        metrics.grossProfitCents != null
          ? `- **Gross profit:** $${(metrics.grossProfitCents / 100).toLocaleString()}`
          : null,
        metrics.roiPercent != null ? `- **ROI:** ${metrics.roiPercent}%` : null,
        metrics.totalCalls != null ? `- **Calls:** ${metrics.totalCalls}` : null,
        metrics.appointmentsBooked != null
          ? `- **Appointments booked:** ${metrics.appointmentsBooked}`
          : null,
        metrics.newPatients != null ? `- **New patients:** ${metrics.newPatients}` : null,
        metrics.conversionRate != null
          ? `- **Conversion rate:** ${metrics.conversionRate}%`
          : null,
        metrics.costPerAcquisitionCents != null
          ? `- **CPA:** $${(metrics.costPerAcquisitionCents / 100).toLocaleString()}`
          : null,
        "",
        ...insights.map((i) => `- ${i}`),
        "",
        `Open **${meta.path}**.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    default: {
      return [
        `Here’s your **${meta.label}** summary:`,
        "",
        formatCompactMetrics(data),
        "",
        `Open **${meta.path}** for the full UI.`,
      ].join("\n");
    }
  }
}

/** Turn nested objects into short bullet lines — never dump raw JSON to the user. */
function formatCompactMetrics(data: unknown, depth = 0): string {
  if (data == null) return "- No data.";
  if (typeof data !== "object") return `- ${String(data)}`;
  if (Array.isArray(data)) {
    if (data.length === 0) return "- None.";
    return data
      .slice(0, 8)
      .map((item, i) => {
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const label =
            (rec.name as string) ||
            (rec.contactName as string) ||
            (rec.title as string) ||
            `#${i + 1}`;
          const extra = Object.entries(rec)
            .filter(([k]) => !["name", "contactName", "title", "id"].includes(k))
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${typeof v === "object" ? "…" : String(v)}`)
            .join(" · ");
          return `- **${label}**${extra ? ` — ${extra}` : ""}`;
        }
        return `- ${String(item)}`;
      })
      .join("\n");
  }

  const entries = Object.entries(data as Record<string, unknown>).slice(0, 12);
  return entries
    .map(([key, value]) => {
      if (value != null && typeof value === "object") {
        if (depth >= 1) return `- **${key}:** (details available in dashboard)`;
        return `- **${key}:**\n${formatCompactMetrics(value, depth + 1)
          .split("\n")
          .map((l) => `  ${l}`)
          .join("\n")}`;
      }
      return `- **${key}:** ${String(value)}`;
    })
    .join("\n");
}

export async function fetchAccountOverview(ctx: OrgContext): Promise<{
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
}> {
  const sections: AccountSectionId[] = [
    "overview",
    "appointments",
    "phone_numbers",
    "invoices",
    "ai_employees",
    "team",
    "crm",
    "integrations",
  ];
  const results = await Promise.all(sections.map((s) => fetchAccountSection(ctx, s)));
  const citations: AvaCitation[] = [];
  const lines: string[] = [
    `Account overview for **${ctx.organization.name}**:`,
    "",
  ];

  for (const result of results) {
    citations.push(...result.citations);
    const meta = SECTION_META.find((m) => m.id === result.section)!;
    if (result.denied) {
      lines.push(`- **${meta.label}:** no access`);
      continue;
    }
    if (!result.ok || !result.data) {
      lines.push(`- **${meta.label}:** unavailable`);
      continue;
    }
    const d = result.data as Record<string, unknown>;
    if (result.section === "overview" || result.section === "calls") {
      const m = d as { totalCalls: number; answeredCalls: number; missedCalls: number };
      lines.push(
        `- **Calls:** ${m.totalCalls.toLocaleString()} total · ${m.answeredCalls.toLocaleString()} answered · ${m.missedCalls.toLocaleString()} missed`,
      );
    } else if (result.section === "appointments") {
      const metrics = d.metrics as { total: number };
      lines.push(`- **Appointments:** ${metrics.total.toLocaleString()}`);
    } else if (result.section === "phone_numbers") {
      const metrics = d.metrics as { total: number };
      lines.push(`- **Phone numbers:** ${metrics.total.toLocaleString()}`);
    } else if (result.section === "invoices") {
      lines.push(`- **Invoices:** ${(d.total as number).toLocaleString()}`);
    } else if (result.section === "ai_employees") {
      const metrics = d.metrics as { total: number; published: number };
      lines.push(`- **AI employees:** ${metrics.total} (${metrics.published} published)`);
    } else if (result.section === "team") {
      const metrics = d.metrics as { total: number; active: number };
      lines.push(`- **Team:** ${metrics.total} members (${metrics.active} active)`);
    } else if (result.section === "crm") {
      lines.push(`- **CRM deals:** ${(d.totalDeals as number).toLocaleString()}`);
    } else if (result.section === "integrations") {
      const metrics = d.metrics as { connected: number; total: number };
      lines.push(`- **Integrations:** ${metrics.connected}/${metrics.total} connected`);
    }
  }

  lines.push("", "Ask about any area for more detail, or open it from the sidebar.");

  return {
    reply: lines.join("\n"),
    citations: [...new Map(citations.map((c) => [`${c.path}:${c.label}`, c])).values()],
    toolsUsed: ["account_overview"],
  };
}
