import type { ChatMessage } from "@/lib/marketing/chat-agent";
import type { AccountSectionId } from "./account-sections";
import { SECTION_META } from "./account-sections";

export type ConversationContext = {
  lastEntityName: string | null;
  lastEntityType: string | null;
  lastSection: AccountSectionId | null;
  lastMetric: string | null;
  lastPath: string | null;
  lastIntent: string | null;
  lastQueryOp: "count" | "list" | "next" | "summary" | null;
  lastFilterStatus: string | string[] | null;
  lastPage: string | null;
};

const METRIC_HINTS: Array<{ re: RegExp; key: string }> = [
  { re: /\bservice level\b|\bsla\b/i, key: "serviceLevel" },
  { re: /\bagents?\b|\bonline\b|\bstaff/i, key: "agentsOnline" },
  { re: /\bwait\b|\bavg wait\b/i, key: "avgWaitLabel" },
  { re: /\babandon/i, key: "abandoned" },
  { re: /\bin queue\b|\bqueue depth\b/i, key: "callsInQueue" },
  { re: /\bresponse rate\b/i, key: "responseRate" },
  { re: /\bcancell/i, key: "cancelled" },
  { re: /\bpending\b/i, key: "pending" },
];

function sectionFromPath(path: string | null | undefined): AccountSectionId | null {
  if (!path) return null;
  // Prefer the longest path prefix so /dashboard/appointments ≠ overview (/dashboard).
  let best: AccountSectionId | null = null;
  let bestLen = 0;
  for (const meta of SECTION_META) {
    if (path === meta.path || path.startsWith(`${meta.path}/`)) {
      if (meta.path.length > bestLen) {
        bestLen = meta.path.length;
        best = meta.id;
      }
    }
  }
  return best;
}

function sectionFromText(text: string): AccountSectionId | null {
  const lower = text.toLowerCase();
  let best: AccountSectionId | null = null;
  let bestScore = 0;
  for (const meta of SECTION_META) {
    let score = 0;
    for (const kw of meta.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = meta.id;
    }
  }
  return bestScore > 0 ? best : null;
}

function detectFilterFromText(text: string): string | string[] | null {
  const q = text.toLowerCase();
  if (/\bcancell|\bno[\s-]?show/.test(q)) return ["cancelled", "no_show"];
  if (/\bpending\b/.test(q)) return "pending";
  if (/\bconfirmed\b/.test(q)) return "confirmed";
  if (/\bmissed\b/.test(q)) return "missed";
  if (/\bdisconnected\b/.test(q)) return "disconnected";
  if (/\bpublished\b/.test(q)) return "published";
  if (/\bdraft\b/.test(q)) return "draft";
  if (/\bopen\b/.test(q) && /\binvoice/.test(q)) return "open";
  return null;
}

function detectQueryOpFromText(text: string): ConversationContext["lastQueryOp"] {
  const q = text.toLowerCase();
  if (/\b(how many|how much|number of|\*\*\d+\*\*)\b/.test(q)) return "count";
  if (/\b(here are the|you have \*\*\d+|pending appointment)/i.test(text)) return "list";
  if (/\bnext (?:pending )?appointment\b/i.test(text)) return "next";
  if (/\b(list|show|give me)\b/.test(q)) return "list";
  return null;
}

/**
 * Reconstruct conversational focus from recent turns
 * (entity, module, metric, path, filter, query op).
 */
export function buildConversationContext(
  messages: ChatMessage[] | undefined,
): ConversationContext {
  const empty: ConversationContext = {
    lastEntityName: null,
    lastEntityType: null,
    lastSection: null,
    lastMetric: null,
    lastPath: null,
    lastIntent: null,
    lastQueryOp: null,
    lastFilterStatus: null,
    lastPage: null,
  };
  if (!messages?.length) return empty;

  let lastEntityName: string | null = null;
  let lastEntityType: string | null = null;
  let lastSection: AccountSectionId | null = null;
  let lastMetric: string | null = null;
  let lastPath: string | null = null;
  let lastIntent: string | null = null;
  let lastQueryOp: ConversationContext["lastQueryOp"] = null;
  let lastFilterStatus: string | string[] | null = null;
  let lastPage: string | null = null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg?.content) continue;

    if (!lastMetric) {
      for (const hint of METRIC_HINTS) {
        if (hint.re.test(msg.content)) {
          lastMetric = hint.key;
          break;
        }
      }
    }

    if (!lastFilterStatus) {
      lastFilterStatus = detectFilterFromText(msg.content);
    }

    if (!lastQueryOp) {
      lastQueryOp = detectQueryOpFromText(msg.content);
    }

    if (msg.role === "assistant") {
      if (/couldn'?t find/i.test(msg.content)) continue;

      if (!lastEntityName) {
        const card = msg.content.match(/^\*\*([^*]+)\*\*\s*(?:—|-|–)\s*([^\n]+)/m);
        if (card?.[1]) {
          lastEntityName = card[1].trim();
          lastEntityType = card[2]?.trim() ?? null;
        } else {
          const attr = msg.content.match(
            /^\*\*([^*]+)\*\*\s+(?:average wait|status|service level|agents|[a-z ]+)\s+is\s+\*\*/im,
          );
          if (attr?.[1]) lastEntityName = attr[1].trim();
        }
        if (!lastEntityName) {
          const basedOn = msg.content.match(/based on\s+\*\*([^*]+)\*\*/i);
          if (basedOn?.[1]) {
            lastEntityName = basedOn[1].trim();
            lastEntityType = lastEntityType ?? "Workflow";
          }
        }
        if (!lastEntityName) {
          const nextAppt = msg.content.match(
            /next (?:pending )?appointment is \*\*([^*]+)\*\*/i,
          );
          if (nextAppt?.[1]) {
            lastEntityName = nextAppt[1].trim();
            lastEntityType = "Appointment";
          }
        }
      }

      if (!lastPath) {
        const path = msg.content.match(/\/dashboard\/[a-z0-9\-_/]+/i);
        if (path?.[0]) {
          lastPath = path[0];
          lastPage = path[0];
        }
      }

      if (!lastSection) {
        lastSection = sectionFromPath(lastPath) ?? sectionFromText(msg.content);
      }
    }

    if (msg.role === "user") {
      if (!lastSection) lastSection = sectionFromText(msg.content);
      if (!lastIntent) {
        if (/\bhow many\b/i.test(msg.content)) lastIntent = "metric_count";
        else if (/\b(list|give me|show)\b/i.test(msg.content)) lastIntent = "filtered_list";
        else if (/\bwhy\b/i.test(msg.content)) lastIntent = "diagnostic";
        else if (/\bimprove\b/i.test(msg.content)) lastIntent = "optimize";
      }
    }

    if (
      lastEntityName &&
      lastSection &&
      lastMetric &&
      lastFilterStatus &&
      lastQueryOp
    ) {
      break;
    }
  }

  return {
    lastEntityName,
    lastEntityType,
    lastSection,
    lastMetric,
    lastPath,
    lastIntent,
    lastQueryOp,
    lastFilterStatus,
    lastPage,
  };
}
