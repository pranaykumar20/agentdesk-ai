import type { OrgContext } from "@/lib/auth";
import type { AvaCitation } from "./citations";
import { mergeCitations } from "./citations";
import { resolvePageContext, type PageContext } from "./page-context";
import {
  fetchAccountSection,
  SECTION_META,
  type AccountSectionId,
  type SectionFetchResult,
} from "./account-sections";

export type ModuleMetricAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  sections: AccountSectionId[];
  metricId: string;
};

type MetricDef = {
  id: string;
  section: AccountSectionId;
  /** Matches the metric / property the user asked for. */
  patterns: RegExp[];
  /** Extra words that confirm this feature (optional — page context can also confirm). */
  sectionHints: RegExp[];
  label: string;
  format: (data: Record<string, unknown>) => string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function moneyFromCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function pageAreaToSection(area: PageContext["area"] | undefined): AccountSectionId | null {
  switch (area) {
    case "whatsapp":
      return "whatsapp";
    case "contact-center":
      return "contact_center";
    case "sms":
      return "sms";
    case "call-queues":
      return "call_queues";
    case "live-monitor":
      return "live_monitor";
    case "calls":
      return "calls";
    case "crm":
      return "crm";
    case "billing":
      return "billing";
    case "integrations":
      return "integrations";
    case "workflows":
      return "workflows";
    case "training":
      return "training";
    case "revenue":
      return "roi";
    case "analytics":
      return "overview";
    case "team":
      return "team";
    case "locations":
      return "locations";
    case "ai-employees":
      return "ai_employees";
    case "appointments":
      return "appointments";
    case "phone-numbers":
      return "phone_numbers";
    case "knowledge":
      return "knowledge";
    case "routing":
      return "routing";
    case "voice-flows":
      return "voice_flows";
    default:
      return null;
  }
}

function metricsOf(data: Record<string, unknown>): Record<string, unknown> | null {
  return asRecord(data.metrics) ?? (data.total != null || data.totalCampaigns != null ? data : null);
}

const MODULE_METRICS: MetricDef[] = [
  {
    id: "whatsapp.responseRate",
    section: "whatsapp",
    label: "Response Rate",
    patterns: [/\bresponse rate\b/i, /\breply rate\b/i],
    sectionHints: [/\bwhatsapp\b/i, /\bwa\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const rate = num(metrics?.responseRate);
      if (rate == null) return null;
      return `WhatsApp Automation **Response Rate** is **${rate}%**.`;
    },
  },
  {
    id: "whatsapp.readRate",
    section: "whatsapp",
    label: "Read Rate",
    patterns: [/\bread rate\b/i],
    sectionHints: [/\bwhatsapp\b/i, /\bwa\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const rate = num(metrics?.readRate);
      if (rate == null) return null;
      return `WhatsApp **Read Rate** is **${rate}%**.`;
    },
  },
  {
    id: "whatsapp.messagesSent",
    section: "whatsapp",
    label: "Messages Sent",
    patterns: [/\bmessages? sent\b/i],
    sectionHints: [/\bwhatsapp\b/i, /\bwa\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const n = num(metrics?.messagesSent);
      if (n == null) return null;
      return `WhatsApp **Messages Sent:** **${n.toLocaleString()}**.`;
    },
  },
  {
    id: "whatsapp.activeWorkflows",
    section: "whatsapp",
    label: "Active Workflows",
    patterns: [/\bactive workflows?\b/i],
    sectionHints: [/\bwhatsapp\b/i, /\bwa\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const n = num(metrics?.activeWorkflows);
      if (n == null) return null;
      return `WhatsApp has **${n}** active workflow${n === 1 ? "" : "s"}.`;
    },
  },
  {
    id: "contact_center.topAgents",
    section: "contact_center",
    label: "Top agents today",
    patterns: [
      /\btop agents? today\b/i,
      /\bbest agents? today\b/i,
      /\bagents? today\b/i,
      /\bleading agents? today\b/i,
    ],
    sectionHints: [/\bcontact center\b/i, /\bomnichannel\b/i, /\binbox\b/i],
    format: (data) => {
      const agents = data.topAgents;
      if (!Array.isArray(agents) || agents.length === 0) return null;
      const lines = agents.slice(0, 5).map((raw, i) => {
        const a = asRecord(raw);
        const name = String(a?.name ?? "Agent");
        const resolutions = num(a?.resolutions);
        return `${i + 1}. **${name}**${resolutions != null ? ` — ${resolutions} resolutions` : ""}`;
      });
      return ["**Top agents today** (Contact Center):", "", ...lines].join("\n");
    },
  },
  {
    id: "roi.totalRevenue",
    section: "roi",
    label: "Total Revenue",
    patterns: [
      /\btotal revenue\b/i,
      /\brevenue total\b/i,
      /\bwhat(?:'s| is) (?:the )?revenue\b/i,
      /\bhow much revenue\b/i,
    ],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bprofit\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const cents = num(metrics?.totalRevenueCents);
      if (cents == null) return null;
      return `**Total Revenue** is **${moneyFromCents(cents)}**.`;
    },
  },
  {
    id: "roi.roiPercent",
    section: "roi",
    label: "ROI",
    patterns: [/\b(?:what(?:'s| is) (?:the |our )?|show (?:me )?)?roi\b/i, /\breturn on investment\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bprofit\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const roi = num(metrics?.roiPercent);
      if (roi == null) return null;
      return `**ROI** is **${roi}%**.`;
    },
  },
  {
    id: "roi.bySource",
    section: "roi",
    label: "Revenue by source",
    patterns: [
      /\brevenue by source\b/i,
      /\bsources? of revenue\b/i,
      /\brevenue sources?\b/i,
      /\bby source\b/i,
    ],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bsource\b/i],
    format: (data) => {
      const sources = data.sources;
      if (!Array.isArray(sources) || sources.length === 0) return null;
      const lines = sources.map((raw, i) => {
        const s = asRecord(raw);
        const name = String(s?.source ?? "Source");
        const pct = num(s?.pct);
        return `${i + 1}. **${name}** — ${pct != null ? `${pct}%` : "—"}`;
      });
      return ["**Revenue by source:**", "", ...lines].join("\n");
    },
  },
  {
    id: "roi.topAiAgents",
    section: "roi",
    label: "Top performing AI agents",
    patterns: [
      /\btop performing ai agents?\b/i,
      /\btop ai agents?\b/i,
      /\bbest (?:performing )?ai agents?\b/i,
      /\bai agents? (?:by )?revenue\b/i,
      /\btop performing agents?\b/i,
    ],
    sectionHints: [
      /\brevenue\b/i,
      /\broi\b/i,
      /\bai agents?\b/i,
      /\bperforming\b/i,
    ],
    format: (data) => {
      const agents = data.agents;
      if (!Array.isArray(agents) || agents.length === 0) return null;
      const ranked = [...agents].sort((a, b) => {
        const ac = num(asRecord(a)?.revenueCents) ?? 0;
        const bc = num(asRecord(b)?.revenueCents) ?? 0;
        return bc - ac;
      });
      const lines = ranked.map((raw, i) => {
        const a = asRecord(raw);
        const name = String(a?.name ?? "Agent");
        const cents = num(a?.revenueCents);
        const growth = num(a?.growthPct);
        return `${i + 1}. **${name}** — ${cents != null ? moneyFromCents(cents) : "—"}${
          growth != null ? ` (+${growth}% growth)` : ""
        }`;
      });
      return ["**Top performing AI agents** (Revenue & ROI):", "", ...lines].join("\n");
    },
  },
  {
    id: "contact_center.sla",
    section: "contact_center",
    label: "SLA compliance",
    patterns: [/\bsla(?:\s+compliance)?\b/i],
    sectionHints: [/\bcontact center\b/i, /\bomnichannel\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const sla = num(metrics?.slaCompliance);
      if (sla == null) return null;
      return `Contact Center **SLA compliance** is **${sla}%**.`;
    },
  },
  {
    id: "contact_center.csat",
    section: "contact_center",
    label: "CSAT",
    patterns: [/\bcsat\b/i, /\bcustomer satisfaction\b/i],
    sectionHints: [/\bcontact center\b/i],
    format: (data) => {
      const metrics = asRecord(data.metrics);
      const csat = num(metrics?.csat);
      if (csat == null) return null;
      return `Contact Center **CSAT** is **${csat}**.`;
    },
  },
  {
    id: "contact_center.open",
    section: "contact_center",
    label: "Open conversations",
    patterns: [/\bopen conversations?\b/i, /\bhow many open conversations?\b/i],
    sectionHints: [/\bcontact center\b/i, /\bomnichannel\b/i, /\binbox\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.open);
      if (n == null) return null;
      return `Contact Center has **${n}** open conversations.`;
    },
  },
  {
    id: "contact_center.newToday",
    section: "contact_center",
    label: "New today",
    patterns: [/\bnew today\b/i, /\bnew conversations? today\b/i],
    sectionHints: [/\bcontact center\b/i, /\binbox\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.newToday);
      if (n == null) return null;
      return `Contact Center has **${n}** new conversations today.`;
    },
  },
  {
    id: "contact_center.resolutionsToday",
    section: "contact_center",
    label: "Resolutions today",
    patterns: [/\bresolutions? today\b/i, /\bresolved today\b/i],
    sectionHints: [/\bcontact center\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.resolutionsToday);
      if (n == null) return null;
      return `Contact Center resolved **${n}** conversations today.`;
    },
  },
  {
    id: "contact_center.agentsOnline",
    section: "contact_center",
    label: "Agents online",
    patterns: [/\bagents? online\b/i, /\bagents? available\b/i],
    sectionHints: [/\bcontact center\b/i, /\binbox\b/i],
    format: (data) => {
      const m = metricsOf(data);
      const online = num(m?.agentsOnline);
      const total = num(m?.agentsTotal);
      if (online == null) return null;
      return total != null
        ? `Contact Center has **${online} / ${total}** agents online.`
        : `Contact Center has **${online}** agents online.`;
    },
  },
  {
    id: "contact_center.avgResponse",
    section: "contact_center",
    label: "Avg response",
    patterns: [/\bavg(?:erage)? response\b/i, /\bresponse time\b/i],
    sectionHints: [/\bcontact center\b/i],
    format: (data) => {
      const label = metricsOf(data)?.avgResponseLabel;
      if (label == null || label === "") return null;
      return `Contact Center **average response** is **${String(label)}**.`;
    },
  },
  {
    id: "sms.responseRate",
    section: "sms",
    label: "SMS Response Rate",
    patterns: [/\bresponse rate\b/i, /\breply rate\b/i],
    sectionHints: [/\bsms\b/i, /\btext campaign\b/i, /\bcampaigns?\b/i],
    format: (data) => {
      const rate = num(metricsOf(data)?.responseRate);
      if (rate == null) return null;
      return `SMS Campaigns **Response Rate** is **${rate}%**.`;
    },
  },
  {
    id: "sms.deliveryRate",
    section: "sms",
    label: "Delivery Rate",
    patterns: [/\bdelivery rate\b/i, /\bdeliverability\b/i],
    sectionHints: [/\bsms\b/i, /\btext\b/i, /\bcampaign\b/i],
    format: (data) => {
      const rate = num(metricsOf(data)?.deliveryRate);
      if (rate == null) return null;
      return `SMS **Delivery Rate** is **${rate}%**.`;
    },
  },
  {
    id: "sms.messagesSent",
    section: "sms",
    label: "SMS Messages Sent",
    patterns: [/\bmessages? sent\b/i],
    sectionHints: [/\bsms\b/i, /\btext campaign\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.messagesSent);
      if (n == null) return null;
      return `SMS Campaigns **Messages Sent:** **${n.toLocaleString()}**.`;
    },
  },
  {
    id: "sms.optOuts",
    section: "sms",
    label: "Opt-outs",
    patterns: [/\bopt[-\s]?outs?\b/i],
    sectionHints: [/\bsms\b/i, /\btext\b/i, /\bcampaign\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.optOuts);
      if (n == null) return null;
      return `SMS Campaigns have **${n}** opt-out${n === 1 ? "" : "s"}.`;
    },
  },
  {
    id: "whatsapp.messagesDelivered",
    section: "whatsapp",
    label: "Messages Delivered",
    patterns: [/\bmessages? delivered\b/i],
    sectionHints: [/\bwhatsapp\b/i, /\bwa\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.messagesDelivered);
      if (n == null) return null;
      return `WhatsApp **Messages Delivered:** **${n.toLocaleString()}**.`;
    },
  },
  {
    id: "roi.aiAttributed",
    section: "roi",
    label: "AI Attributed Revenue",
    patterns: [/\bai attributed\b/i, /\battributed revenue\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bai\b/i],
    format: (data) => {
      const cents = num(metricsOf(data)?.aiAttributedCents);
      if (cents == null) return null;
      return `**AI Attributed Revenue** is **${moneyFromCents(cents)}**.`;
    },
  },
  {
    id: "roi.grossProfit",
    section: "roi",
    label: "Gross Profit",
    patterns: [/\bgross profit\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bprofit\b/i],
    format: (data) => {
      const cents = num(metricsOf(data)?.grossProfitCents);
      if (cents == null) return null;
      return `**Gross Profit** is **${moneyFromCents(cents)}**.`;
    },
  },
  {
    id: "roi.totalCost",
    section: "roi",
    label: "Total Cost",
    patterns: [/\btotal cost\b/i, /\bcost \(ai/i, /\bops cost\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bcost\b/i],
    format: (data) => {
      const cents = num(metricsOf(data)?.totalCostCents);
      if (cents == null) return null;
      return `**Total Cost (AI & Ops)** is **${moneyFromCents(cents)}**.`;
    },
  },
  {
    id: "roi.newPatients",
    section: "roi",
    label: "New Patients",
    patterns: [/\bnew patients?\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bpatient\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.newPatients);
      if (n == null) return null;
      return `**New Patients** this period: **${n.toLocaleString()}**.`;
    },
  },
  {
    id: "roi.cpa",
    section: "roi",
    label: "Cost per Acquisition",
    patterns: [/\bcost per acquisition\b/i, /\bcpa\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bacquisition\b/i, /\bcpa\b/i],
    format: (data) => {
      const cents = num(metricsOf(data)?.costPerAcquisitionCents);
      if (cents == null) return null;
      return `**Cost per Acquisition** is **${moneyFromCents(cents)}**.`;
    },
  },
  {
    id: "roi.conversionRate",
    section: "roi",
    label: "Conversion Rate",
    patterns: [/\bconversion rate\b/i],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bconversion\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.conversionRate);
      if (n == null) return null;
      return `Revenue & ROI **Conversion Rate** is **${n}%**.`;
    },
  },
  {
    id: "roi.fastestGrowing",
    section: "roi",
    label: "Fastest-growing AI agent",
    patterns: [
      /\bfastest[-\s]?growing\b/i,
      /\bgrowing (?:the )?fastest\b/i,
      /\bhighest growth\b/i,
    ],
    sectionHints: [/\brevenue\b/i, /\broi\b/i, /\bai\b/i, /\bagent\b/i],
    format: (data) => {
      const agents = data.agents;
      if (!Array.isArray(agents) || agents.length === 0) return null;
      const ranked = [...agents].sort(
        (a, b) => (num(asRecord(b)?.growthPct) ?? 0) - (num(asRecord(a)?.growthPct) ?? 0),
      );
      const top = asRecord(ranked[0]);
      if (!top) return null;
      return `**${String(top.name)}** is the fastest-growing revenue contributor (**+${num(top.growthPct)}%** growth).`;
    },
  },
  {
    id: "training.modelAccuracy",
    section: "training",
    label: "Model Accuracy",
    patterns: [/\bmodel accuracy\b/i, /\btraining accuracy\b/i],
    sectionHints: [/\btraining\b/i, /\bmodel\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.modelAccuracy);
      if (n == null) return null;
      return `Training **Model Accuracy** is **${n}%**.`;
    },
  },
  {
    id: "training.conversationsAnalyzed",
    section: "training",
    label: "Conversations Analyzed",
    patterns: [/\bconversations? analyzed\b/i],
    sectionHints: [/\btraining\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.conversationsAnalyzed);
      if (n == null) return null;
      return `Training has analyzed **${n.toLocaleString()}** conversations.`;
    },
  },
  {
    id: "live_monitor.active",
    section: "live_monitor",
    label: "Active calls",
    patterns: [/\bactive calls?\b/i, /\bhow many (?:are )?live\b/i],
    sectionHints: [/\blive monitor\b/i, /\blive\b/i, /\bringing\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.activeCalls) ?? num(data.activeCalls);
      if (n == null) return null;
      return `Live Monitor shows **${n}** active call${n === 1 ? "" : "s"}.`;
    },
  },
  {
    id: "live_monitor.ringing",
    section: "live_monitor",
    label: "Ringing",
    patterns: [/\bringing\b/i],
    sectionHints: [/\blive monitor\b/i, /\blive\b/i, /\bcall\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.ringing);
      if (n == null) return null;
      return `**${n}** call${n === 1 ? " is" : "s are"} ringing right now.`;
    },
  },
  {
    id: "live_monitor.agentsAvailable",
    section: "live_monitor",
    label: "Agents available",
    patterns: [/\bagents? available\b/i],
    sectionHints: [/\blive monitor\b/i, /\blive\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.agentsAvailable);
      if (n == null) return null;
      return `Live Monitor shows **${n}** agents available.`;
    },
  },
  {
    id: "live_monitor.avgHandle",
    section: "live_monitor",
    label: "Avg handle time",
    patterns: [/\bavg(?:erage)? handle\b/i, /\bhandle time\b/i],
    sectionHints: [/\blive monitor\b/i, /\blive\b/i],
    format: (data) => {
      const label = metricsOf(data)?.avgHandleLabel;
      if (label == null || label === "") return null;
      return `Live Monitor **average handle time** is **${String(label)}**.`;
    },
  },
  {
    id: "live_monitor.who",
    section: "live_monitor",
    label: "Live calls list",
    patterns: [
      /\bwho(?:'s| is) on (?:a )?live call\b/i,
      /\blive calls? (?:list|right now)\b/i,
      /\bwho(?:'s| is) live\b/i,
    ],
    sectionHints: [/\blive\b/i, /\bmonitor\b/i, /\bcall\b/i],
    format: (data) => {
      const calls = data.calls;
      if (!Array.isArray(calls) || calls.length === 0) return null;
      const lines = calls.map((raw, i) => {
        const c = asRecord(raw);
        return `${i + 1}. **${String(c?.callerName ?? "Caller")}** — ${String(c?.status ?? "—")} · ${String(c?.agentName ?? "—")} · ${String(c?.queueName ?? "—")} (${String(c?.durationLabel ?? "—")})`;
      });
      return ["**Live calls right now:**", "", ...lines].join("\n");
    },
  },
  {
    id: "call_queues.avgWait",
    section: "call_queues",
    label: "Avg wait",
    patterns: [/\bavg(?:erage)? wait\b/i],
    sectionHints: [/\bqueue\b/i, /\bcall queues?\b/i],
    format: (data) => {
      const label = metricsOf(data)?.avgWaitLabel;
      if (label == null || label === "") return null;
      return `Call Queues **average wait** is **${String(label)}**.`;
    },
  },
  {
    id: "call_queues.longestWait",
    section: "call_queues",
    label: "Longest wait",
    patterns: [/\blongest wait\b/i],
    sectionHints: [/\bqueue\b/i, /\bcall queues?\b/i],
    format: (data) => {
      const m = metricsOf(data);
      const label = m?.longestWaitLabel;
      if (label == null || label === "") return null;
      const queue = m?.longestWaitQueue ? ` (${String(m.longestWaitQueue)})` : "";
      return `Call Queues **longest wait** is **${String(label)}**${queue}.`;
    },
  },
  {
    id: "call_queues.abandoned",
    section: "call_queues",
    label: "Abandoned calls",
    patterns: [/\babandoned (?:calls?|rate)?\b/i, /\bhow many abandoned\b/i],
    sectionHints: [/\bqueue\b/i, /\bcall queues?\b/i, /\babandon/i],
    format: (data) => {
      const n = num(metricsOf(data)?.abandoned);
      if (n == null) return null;
      return `Call Queues have **${n}** abandoned call${n === 1 ? "" : "s"} (aggregate).`;
    },
  },
  {
    id: "call_queues.inQueues",
    section: "call_queues",
    label: "Calls in queues",
    patterns: [/\bcalls? in queues?\b/i, /\bhow many (?:calls? )?in queues?\b/i],
    sectionHints: [/\bqueue\b/i, /\bcall queues?\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.callsInQueues);
      if (n == null) return null;
      return `There are **${n}** calls currently in queues.`;
    },
  },
  {
    id: "crm.openTasks",
    section: "crm",
    label: "Open tasks",
    patterns: [/\bopen tasks?\b/i, /\bcrm tasks?\b/i, /\bhow many tasks?\b/i],
    sectionHints: [/\bcrm\b/i, /\bleads?\b/i, /\btasks?\b/i, /\bpipeline\b/i],
    format: (data) => {
      const tasks = data.tasks;
      const count = num(data.openTasks) ?? (Array.isArray(tasks) ? tasks.length : null);
      if (count == null) return null;
      const lines = Array.isArray(tasks)
        ? tasks.map((raw, i) => {
            const t = asRecord(raw);
            return `${i + 1}. **${String(t?.title ?? "Task")}** — ${String(t?.dueLabel ?? "")}`;
          })
        : [];
      return [
        `CRM has **${count}** open task${count === 1 ? "" : "s"}.`,
        ...(lines.length ? ["", ...lines] : []),
      ].join("\n");
    },
  },
  {
    id: "crm.pipelineValue",
    section: "crm",
    label: "Pipeline value",
    patterns: [/\bpipeline value\b/i, /\btotal pipeline\b/i],
    sectionHints: [/\bcrm\b/i, /\bpipeline\b/i, /\bleads?\b/i],
    format: (data) => {
      const cents = num(data.totalValueCents);
      if (cents == null) return null;
      return `CRM **pipeline value** is **${moneyFromCents(cents)}** across **${num(data.totalDeals) ?? "—"}** deals.`;
    },
  },
  {
    id: "crm.won",
    section: "crm",
    label: "Won deals",
    patterns: [/\bhow many won\b/i, /\bwon deals?\b/i],
    sectionHints: [/\bcrm\b/i, /\bpipeline\b/i, /\bwon\b/i],
    format: (data) => {
      const stages = data.byStage;
      if (!Array.isArray(stages)) return null;
      const won = stages.find((s) => {
        const r = asRecord(s);
        return r?.id === "won" || String(r?.label ?? "").toLowerCase() === "won";
      });
      const r = asRecord(won);
      if (!r) return null;
      const count = num(r.count) ?? 0;
      const value = num(r.valueCents);
      return `CRM has **${count}** won deal${count === 1 ? "" : "s"}${
        value != null ? ` (**${moneyFromCents(value)}**)` : ""
      }.`;
    },
  },
  {
    id: "team.roleCounts",
    section: "team",
    label: "Team role counts",
    patterns: [
      /\bhow many admins?\b/i,
      /\bhow many managers?\b/i,
      /\bhow many (?:team )?agents?\b/i,
      /\brole (?:counts?|breakdown)\b/i,
      /\bteam (?:breakdown|roles?)\b/i,
    ],
    sectionHints: [/\bteam\b/i, /\bmembers?\b/i, /\badmins?\b/i, /\bmanagers?\b/i],
    format: (data) => {
      const m = metricsOf(data);
      if (!m) return null;
      return [
        `Team role breakdown:`,
        `- **Admins:** ${num(m.admins) ?? "—"}`,
        `- **Managers:** ${num(m.managers) ?? "—"}`,
        `- **Agents:** ${num(m.agents) ?? "—"}`,
        `- **Total / Active:** ${num(m.total) ?? "—"} / ${num(m.active) ?? "—"}`,
      ].join("\n");
    },
  },
  {
    id: "ai_employees.avgPerformance",
    section: "ai_employees",
    label: "Average performance",
    patterns: [
      /\baverage performance\b/i,
      /\bavg(?:erage)? (?:performance|accuracy|score)\b/i,
    ],
    sectionHints: [/\bai employees?\b/i, /\bagents?\b/i, /\bperformance\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.avgAccuracy);
      if (n == null) return null;
      return `AI Employees **average performance** is **${n}**.`;
    },
  },
  {
    id: "billing.overage",
    section: "billing",
    label: "Overage",
    patterns: [/\boverage\b/i, /\boverage minutes\b/i],
    sectionHints: [/\bbilling\b/i, /\bplan\b/i, /\busage\b/i, /\boverage\b/i],
    format: (data) => {
      // billing section returns usage snapshot at top level
      const mins = num(data.overageMinutes) ?? num(metricsOf(data)?.overageMinutes);
      if (mins == null) return null;
      const usd = num(data.estimatedOverageUsd);
      return mins === 0
        ? `You have **no overage** right now (usage is within plan minutes).`
        : `**Overage:** **${mins.toLocaleString()}** minutes${
            usd != null ? ` (≈ $${usd.toFixed(2)})` : ""
          }.`;
    },
  },
  {
    id: "billing.usage",
    section: "billing",
    label: "Plan usage",
    patterns: [/\bplan usage\b/i, /\bminutes used\b/i, /\busage (?:pct|percent|%)\b/i],
    sectionHints: [/\bbilling\b/i, /\bplan\b/i, /\busage\b/i],
    format: (data) => {
      const used = num(data.minutesUsed);
      const included = num(data.minutesIncluded);
      const pct = num(data.usagePct);
      const plan = data.planName != null ? String(data.planName) : null;
      if (used == null || included == null) return null;
      return [
        plan ? `You're on the **${plan}** plan.` : null,
        `**Usage:** **${used.toLocaleString()} / ${included.toLocaleString()}** minutes${
          pct != null ? ` (**${pct}%**)` : ""
        }.`,
      ]
        .filter(Boolean)
        .join("\n");
    },
  },
  {
    id: "locations.callsThisMonth",
    section: "locations",
    label: "Location calls this month",
    patterns: [
      /\bcalls this month\b/i,
      /\bcalls across locations\b/i,
    ],
    sectionHints: [/\blocations?\b/i, /\boffices?\b/i, /\bbranches?\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.calls) ?? num(asRecord(data.metrics)?.calls);
      if (n == null) return null;
      return `Locations have **${n.toLocaleString()}** calls this month (all sites).`;
    },
  },
  {
    id: "locations.appointmentsThisMonth",
    section: "locations",
    label: "Location appointments this month",
    patterns: [/\bappointments this month\b/i],
    sectionHints: [/\blocations?\b/i, /\boffices?\b/i],
    format: (data) => {
      const n = num(metricsOf(data)?.appointments);
      if (n == null) return null;
      return `Locations have **${n.toLocaleString()}** appointments this month (all sites).`;
    },
  },
  {
    id: "knowledge.failed",
    section: "knowledge",
    label: "Failed documents",
    patterns: [/\bfailed (?:docs?|documents?)\b/i, /\bhow many failed\b/i],
    sectionHints: [/\bknowledge\b/i, /\bdocs?\b/i, /\bfaq\b/i],
    format: (data) => {
      const n = num(data.failed) ?? num(metricsOf(data)?.failed);
      if (n == null) return null;
      return `Knowledge Base has **${n}** failed document${n === 1 ? "" : "s"}.`;
    },
  },
];

export function detectModuleMetricCandidates(
  question: string,
  pathname?: string | null,
): MetricDef[] {
  const q = question.trim();
  const page = resolvePageContext(pathname ?? null);
  const pageSection = pageAreaToSection(page?.area);

  const matched = MODULE_METRICS.filter((m) => m.patterns.some((re) => re.test(q)));
  if (matched.length === 0) return [];

  const preferred = matched.filter(
    (m) => m.sectionHints.some((re) => re.test(q)) || pageSection === m.section,
  );
  if (preferred.length > 0) return preferred;

  // Unique metric label with no competing defs (e.g. bare "response rate").
  if (matched.length === 1) return matched;

  // Ambiguous across modules — caller may clarify.
  return matched;
}

export function looksLikeModuleMetricQuestion(
  question: string,
  pathname?: string | null,
): boolean {
  return detectModuleMetricCandidates(question, pathname).length > 0;
}

function clarifyingFromMetrics(metrics: MetricDef[]): string {
  const lines = metrics.map((m) => {
    const meta = SECTION_META.find((s) => s.id === m.section);
    return `- **${m.label}** in **${meta?.label ?? m.section}** (${meta?.path ?? ""})`;
  });
  return [
    "I found a few metrics that could match — which should I check?",
    "",
    ...lines,
    "",
    "Tell me the feature name (e.g. WhatsApp, Contact Center) if you want me to narrow it down.",
  ].join("\n");
}

/**
 * Answer a known feature-level KPI from live section data (not a named record).
 * e.g. WhatsApp Response Rate → 18.7%, Contact Center top agents today.
 */
export async function answerModuleMetric(
  ctx: OrgContext,
  question: string,
  pathname?: string | null,
  pageCitations: AvaCitation[] = [],
): Promise<ModuleMetricAnswer | null> {
  const candidates = detectModuleMetricCandidates(question, pathname);
  if (candidates.length === 0) return null;

  // Ambiguous across modules → ask which one.
  const sections = new Set(candidates.map((c) => c.section));
  if (sections.size > 1) {
    return {
      metricId: "ambiguous",
      reply: clarifyingFromMetrics(candidates),
      citations: pageCitations,
      toolsUsed: ["module_metric_clarify"],
      sections: [...sections],
    };
  }

  const metric = candidates[0]!;
  const result: SectionFetchResult = await fetchAccountSection(ctx, metric.section);
  if (!result.ok || result.denied || !result.data) {
    const meta = SECTION_META.find((s) => s.id === metric.section);
    if (result.denied) {
      return {
        metricId: metric.id,
        reply: `Access to **${meta?.label ?? metric.section}** is restricted for your role — you don’t have permission to view **${metric.label}**.`,
        citations: mergeCitations([...pageCitations, ...result.citations]),
        toolsUsed: [`section:${metric.section}`, "permission_denied"],
        sections: [metric.section],
      };
    }
    return {
      metricId: metric.id,
      reply: [
        `I couldn’t load **${metric.label}** from **${meta?.label ?? metric.section}** right now.`,
        meta ? `Open **${meta.path}** to check the live number.` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      citations: mergeCitations([...pageCitations, ...result.citations]),
      toolsUsed: [`section:${metric.section}`],
      sections: [metric.section],
    };
  }

  const data = asRecord(result.data) ?? {};
  const formatted = metric.format(data);
  if (!formatted) {
    const meta = SECTION_META.find((s) => s.id === metric.section);
    return {
      metricId: metric.id,
      reply: [
        `I looked in **${meta?.label ?? metric.section}** but didn’t find a stored **${metric.label}** value.`,
        "",
        "I can also check related properties on that page — what would you like me to look at?",
        meta ? `\nOpen **${meta.path}** for the full view.` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      citations: mergeCitations([...pageCitations, ...result.citations]),
      toolsUsed: [`section:${metric.section}`, "module_metric"],
      sections: [metric.section],
    };
  }

  const meta = SECTION_META.find((s) => s.id === metric.section);
  return {
    metricId: metric.id,
    reply: [
      formatted,
      "",
      meta ? `Open **${meta.path}** for the full **${meta.label}** view.` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    citations: mergeCitations([
      ...pageCitations,
      ...result.citations,
      ...(meta
        ? [
            {
              label: `${meta.label} · ${metric.label}`,
              path: meta.path,
              tool: "module_metric",
            },
          ]
        : []),
    ]),
    toolsUsed: [`section:${metric.section}`, "module_metric"],
    sections: [metric.section],
  };
}

/** Suggest follow-up checks when Ava is unsure what the user meant. */
export function formatUnsureSuggestions(options: {
  pathname?: string | null;
  detectedSections?: AccountSectionId[];
  foundLabels?: string[];
}): string {
  const page = resolvePageContext(options.pathname ?? null);
  const pageSection = pageAreaToSection(page?.area);
  const sections = [
    ...(options.detectedSections ?? []),
    ...(pageSection ? [pageSection] : []),
  ];
  const uniqueSections = [...new Set(sections)].slice(0, 3);

  const suggestions: string[] = [];
  if (options.foundLabels?.length) {
    for (const label of options.foundLabels.slice(0, 4)) {
      suggestions.push(`- ${label}`);
    }
  }
  for (const id of uniqueSections) {
    const meta = SECTION_META.find((s) => s.id === id);
    if (!meta) continue;
    if (id === "whatsapp") {
      suggestions.push("- WhatsApp **Response Rate**, **Read Rate**, or recent conversations");
    } else if (id === "contact_center") {
      suggestions.push("- Contact Center **Top agents today**, SLA, or open conversations");
    } else if (id === "call_queues") {
      suggestions.push("- Call queue **service level**, wait times, or agents online");
    } else if (id === "roi") {
      suggestions.push(
        "- Revenue & ROI · **Total Revenue**, **Revenue by source**, or **Top performing AI agents**",
      );
    } else {
      suggestions.push(`- **${meta.label}** summary on ${meta.path}`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "- **Calls** · durations, dispositions, who handled a caller",
      "- **WhatsApp** · response rate, read rate, conversations",
      "- **Contact Center** · top agents today, SLA, CSAT",
      "- **Revenue & ROI** · total revenue, by source, top AI agents",
      "- **Call Queues** · service level, wait times",
      "- **Workflows** · published automations and run counts",
    );
  }

  return [
    "I’m not fully sure what you want me to check. Here’s what I can look up next:",
    "",
    ...[...new Set(suggestions)].slice(0, 6),
    "",
    "Tell me which one — or name the page/feature and the field (e.g. “WhatsApp response rate”).",
  ].join("\n");
}
