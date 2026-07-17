import type { AccountSectionId } from "./account-sections";
import type { ConversationContext } from "./conversation-context";
import type { AvaIntent, AvaIntentKind } from "./intent";
import { resolvePageContext } from "./page-context";

export type AvaQueryOp =
  | "count"
  | "list"
  | "next"
  | "summary"
  | "record"
  | "attribute"
  | "diagnostic"
  | "optimize"
  | "concept"
  | "build"
  | "navigate"
  | "clarify";

export type AvaStatusFilter =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
  | "missed"
  | "answered"
  | "voicemail"
  | "open"
  | "paid"
  | "disconnected"
  | "connected"
  | "needs_attention"
  | "published"
  | "draft"
  | "active"
  | "paused";

export type AvaQueryPlan = {
  intent: AvaIntentKind;
  op: AvaQueryOp;
  section: AccountSectionId | null;
  filters: {
    status?: AvaStatusFilter | AvaStatusFilter[];
    q?: string;
    date?: "today" | "tomorrow" | "week";
  };
  fields: string[];
  sort: "startsAt_asc" | "startsAt_desc" | "recent" | "none";
  limit: number;
  needsFullRecords: boolean;
  needsPriorContext: boolean;
  needsExplanation: boolean;
  answerFormat: "count" | "list" | "record" | "diagnostic" | "prose";
  citationPath: string | null;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032']/g, "'")
    .replace(/[\u201C\u201D\u201E"]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\bwhats\s*app\b/g, "whatsapp")
    .replace(/\bno[\s-]?shows?\b/g, "no_show")
    .replace(/\bcancel+ed\b/g, "cancelled");
}

const PATH_BY_SECTION: Partial<Record<AccountSectionId, string>> = {
  appointments: "/dashboard/appointments",
  calls: "/dashboard/calls",
  call_queues: "/dashboard/call-queues",
  contact_center: "/dashboard/contact-center",
  invoices: "/dashboard/billing",
  billing: "/dashboard/billing",
  integrations: "/dashboard/integrations",
  workflows: "/dashboard/workflows",
  crm: "/dashboard/crm",
  whatsapp: "/dashboard/whatsapp",
  sms: "/dashboard/sms-campaigns",
  team: "/dashboard/team",
  locations: "/dashboard/locations",
};

function detectStatusFilter(q: string): AvaStatusFilter | AvaStatusFilter[] | undefined {
  if (/\b(cancelled|canceled|no_show|no show)\b/.test(q)) {
    // Appointments treat cancelled + no-show as one operational bucket in metrics.
    if (/\bno_show\b/.test(q) && !/\bcancell/.test(q)) return "no_show";
    if (/\bcancell/.test(q) && /\bno_show\b/.test(q)) return ["cancelled", "no_show"];
    if (/\bcancell/.test(q)) return ["cancelled", "no_show"];
  }
  if (/\bpending\b/.test(q)) return "pending";
  if (/\bconfirmed\b/.test(q)) return "confirmed";
  if (/\bcompleted\b/.test(q)) return "completed";
  // Avoid treating workflow names like "Missed Call Follow-up" as a missed-calls filter.
  if (/\bmissed calls?\b/.test(q) || (/\bmissed\b/.test(q) && /\bcalls?\b/.test(q) && !/\bfollow-?up\b/.test(q))) {
    return "missed";
  }
  if (/\banswered\b/.test(q)) return "answered";
  if (/\bvoicemails?\b/.test(q)) return "voicemail";
  if (/\b(open|unpaid)\b/.test(q) && /\b(invoice|bill)/.test(q)) return "open";
  if (/\bpaid\b/.test(q) && /\binvoice/.test(q)) return "paid";
  if (/\bdisconnected\b/.test(q)) return "disconnected";
  if (/\bconnected\b/.test(q) && /\bintegration/.test(q)) return "connected";
  if (/\bneeds? attention\b/.test(q)) return "needs_attention";
  if (/\bpublished\b/.test(q)) return "published";
  if (/\bdraft\b/.test(q)) return "draft";
  if (/\bpaused\b/.test(q) && /\b(rule|routing)/.test(q)) return "paused";
  if (/\bactive\b/.test(q) && /\b(workflow|rule|integration)/.test(q)) return "active";
  return undefined;
}

function detectDateFilter(q: string): "today" | "tomorrow" | "week" | undefined {
  if (/\btoday\b/.test(q)) return "today";
  if (/\btomorrow\b/.test(q)) return "tomorrow";
  if (/\b(this week|past week|last 7 days)\b/.test(q)) return "week";
  return undefined;
}

function wantsList(q: string): boolean {
  return (
    /\b(list|show|give me|which|what are the|pull up|display)\b/.test(q) ||
    /\bpending list\b/.test(q) ||
    /\blist of\b/.test(q)
  );
}

function wantsCount(q: string): boolean {
  return /\b(how many|how much|count|total number|number of)\b/.test(q);
}

function wantsNext(q: string, context?: ConversationContext | null): boolean {
  if (/\b(which one is next|what(?:'s| is) next|next (?:one|appointment|call))\b/.test(q)) {
    return true;
  }
  if (
    context?.lastSection === "appointments" &&
    context.lastQueryOp === "list" &&
    /\b(next|soonest|earliest)\b/.test(q)
  ) {
    return true;
  }
  return false;
}

function defaultFields(section: AccountSectionId | null): string[] {
  switch (section) {
    case "appointments":
      return ["contactName", "serviceName", "startsAt", "status", "providerName"];
    case "calls":
      return ["contactName", "status", "startedAt", "durationLabel", "agentName"];
    case "invoices":
      return ["number", "status", "amountUsd", "periodLabel"];
    case "integrations":
      return ["name", "status", "category"];
    case "workflows":
      return ["name", "status", "runs"];
    default:
      return [];
  }
}

/**
 * Build a deterministic query plan from intent + message + page + memory.
 * Prefer exact count/list ops over module summaries.
 */
export function buildAvaQueryPlan(
  intent: AvaIntent,
  question: string,
  pathname?: string | null,
  context?: ConversationContext | null,
): AvaQueryPlan {
  const q = normalize(question);
  const page = resolvePageContext(pathname ?? null);
  let section = intent.section ?? context?.lastSection ?? null;

  // Page context strengthens module when the question is short / referential.
  if (!section && page) {
    const areaMap: Record<string, AccountSectionId> = {
      appointments: "appointments",
      calls: "calls",
      "call-queues": "call_queues",
      "contact-center": "contact_center",
      billing: "billing",
      integrations: "integrations",
      workflows: "workflows",
      crm: "crm",
      whatsapp: "whatsapp",
    };
    section = areaMap[page.area] ?? null;
  }

  const statusInQuestion = detectStatusFilter(q);
  // Only reuse prior filter for explicit follow-ups — never leak into build/concept asks.
  const statusFromContext =
    wantsNext(q, context) || /\b(those|them|same filter|same status)\b/.test(q)
      ? ((context?.lastFilterStatus as AvaStatusFilter | AvaStatusFilter[] | null | undefined) ??
        undefined)
      : undefined;
  const status = statusInQuestion ?? statusFromContext;
  const date = detectDateFilter(q);
  const citationPath = section ? (PATH_BY_SECTION[section] ?? null) : null;

  // Follow-up: "which one is next?" after a pending appointments list
  if (wantsNext(q, context)) {
    return {
      intent: intent.kind === "unknown" ? "filtered_list" : intent.kind,
      op: "next",
      section: section ?? "appointments",
      filters: {
        status:
          status ??
          (context?.lastFilterStatus as AvaStatusFilter | AvaStatusFilter[] | undefined) ??
          "pending",
        date,
      },
      fields: defaultFields(section ?? "appointments"),
      sort: "startsAt_asc",
      limit: 1,
      needsFullRecords: true,
      needsPriorContext: true,
      needsExplanation: false,
      answerFormat: "record",
      citationPath: citationPath ?? "/dashboard/appointments",
    };
  }

  // Explicit count with a filter → metric_count
  if (
    wantsCount(q) &&
    status &&
    (section || /\b(appointment|call|invoice|integration|workflow)/.test(q))
  ) {
    if (!section) {
      if (/\bappointment/.test(q)) section = "appointments";
      else if (/\bcalls?\b/.test(q)) section = "calls";
      else if (/\binvoice/.test(q)) section = "invoices";
      else if (/\bintegration/.test(q)) section = "integrations";
      else if (/\bworkflow/.test(q)) section = "workflows";
    }
    return {
      intent: "metric_count",
      op: "count",
      section,
      filters: { status, date, q: undefined },
      fields: [],
      sort: "none",
      limit: 0,
      needsFullRecords: false,
      needsPriorContext: false,
      needsExplanation: false,
      answerFormat: "count",
      citationPath,
    };
  }

  // Filtered list: "give me pending appointments", "show cancelled appointments"
  if (
    (wantsList(q) || intent.kind === "filtered_list") &&
    status &&
    (section || /\b(appointment|call|invoice|integration|workflow)/.test(q))
  ) {
    if (!section) {
      if (/\bappointment/.test(q)) section = "appointments";
      else if (/\bcalls?\b/.test(q)) section = "calls";
      else if (/\binvoice/.test(q)) section = "invoices";
      else if (/\bintegration/.test(q)) section = "integrations";
      else if (/\bworkflow/.test(q)) section = "workflows";
    }
    return {
      intent: "filtered_list",
      op: "list",
      section,
      filters: { status, date },
      fields: defaultFields(section),
      sort: section === "appointments" ? "startsAt_asc" : "recent",
      limit: 20,
      needsFullRecords: true,
      needsPriorContext: false,
      needsExplanation: false,
      answerFormat: "list",
      citationPath,
    };
  }

  // Status + module without list/count verb still often means filtered list
  // e.g. "pending appointments?" / "cancelled appointments"
  // Never override build/concept/entity intents.
  if (
    status &&
    section &&
    (intent.kind === "metric_count" ||
      intent.kind === "filtered_list" ||
      intent.kind === "unknown" ||
      intent.kind === "account_summary") &&
    /\b(appointment|call|invoice|integration|workflow)/.test(q) &&
    !/\b(what is a|tell me about|explain|help me|building|build)\b/.test(q)
  ) {
    const op: AvaQueryOp = wantsCount(q) ? "count" : "list";
    return {
      intent: op === "count" ? "metric_count" : "filtered_list",
      op,
      section,
      filters: { status, date },
      fields: defaultFields(section),
      sort: section === "appointments" ? "startsAt_asc" : "recent",
      limit: op === "list" ? 20 : 0,
      needsFullRecords: op === "list",
      needsPriorContext: false,
      needsExplanation: false,
      answerFormat: op === "count" ? "count" : "list",
      citationPath,
    };
  }

  // Map remaining intents to plan ops
  switch (intent.kind) {
    case "record_attribute":
      return {
        intent: intent.kind,
        op: "attribute",
        section,
        filters: {},
        fields: [],
        sort: "none",
        limit: 1,
        needsFullRecords: true,
        needsPriorContext: Boolean(context?.lastEntityName),
        needsExplanation: false,
        answerFormat: "record",
        citationPath,
      };
    case "entity_lookup":
      return {
        intent: intent.kind,
        op: "record",
        section,
        filters: {},
        fields: [],
        sort: "none",
        limit: 1,
        needsFullRecords: true,
        needsPriorContext: Boolean(context?.lastEntityName),
        needsExplanation: false,
        answerFormat: "record",
        citationPath,
      };
    case "diagnostic":
      return {
        intent: intent.kind,
        op: "diagnostic",
        section: section ?? "call_queues",
        filters: {},
        fields: [],
        sort: "none",
        limit: 1,
        needsFullRecords: true,
        needsPriorContext: true,
        needsExplanation: true,
        answerFormat: "diagnostic",
        citationPath: citationPath ?? "/dashboard/call-queues",
      };
    case "optimize":
      return {
        intent: intent.kind,
        op: "optimize",
        section: section ?? context?.lastSection ?? "call_queues",
        filters: {},
        fields: [],
        sort: "none",
        limit: 1,
        needsFullRecords: true,
        needsPriorContext: true,
        needsExplanation: true,
        answerFormat: "diagnostic",
        citationPath,
      };
    case "concept":
      return {
        intent: intent.kind,
        op: "concept",
        section,
        filters: {},
        fields: [],
        sort: "none",
        limit: 0,
        needsFullRecords: false,
        needsPriorContext: false,
        needsExplanation: true,
        answerFormat: "prose",
        citationPath,
      };
    case "build_help":
      return {
        intent: intent.kind,
        op: "build",
        section: section ?? "workflows",
        filters: {},
        fields: [],
        sort: "none",
        limit: 0,
        needsFullRecords: false,
        needsPriorContext: true,
        needsExplanation: true,
        answerFormat: "prose",
        citationPath: "/dashboard/workflows",
      };
    case "navigation":
      return {
        intent: intent.kind,
        op: "navigate",
        section,
        filters: {},
        fields: [],
        sort: "none",
        limit: 0,
        needsFullRecords: false,
        needsPriorContext: false,
        needsExplanation: false,
        answerFormat: "prose",
        citationPath,
      };
    case "metric_count":
      return {
        intent: intent.kind,
        op: "count",
        section,
        filters: { status, date },
        fields: [],
        sort: "none",
        limit: 0,
        needsFullRecords: false,
        needsPriorContext: false,
        needsExplanation: false,
        answerFormat: "count",
        citationPath,
      };
    case "filtered_list":
      return {
        intent: intent.kind,
        op: "list",
        section,
        filters: { status, date },
        fields: defaultFields(section),
        sort: section === "appointments" ? "startsAt_asc" : "recent",
        limit: 20,
        needsFullRecords: true,
        needsPriorContext: false,
        needsExplanation: false,
        answerFormat: "list",
        citationPath,
      };
    default:
      return {
        intent: intent.kind,
        op: "summary",
        section,
        filters: { status, date },
        fields: [],
        sort: "none",
        limit: 0,
        needsFullRecords: false,
        needsPriorContext: false,
        needsExplanation: false,
        answerFormat: "prose",
        citationPath,
      };
  }
}

export function isExactDataPlan(plan: AvaQueryPlan): boolean {
  return plan.op === "count" || plan.op === "list" || plan.op === "next";
}
