import { SECTION_META, type AccountSectionId } from "./account-sections";
import type { ConversationContext } from "./conversation-context";

export type AvaIntentKind =
  | "concept"
  | "module_summary"
  | "account_summary"
  | "metric_count"
  | "filtered_list"
  | "entity_lookup"
  | "record_attribute"
  | "diagnostic"
  | "optimize"
  | "build_help"
  | "navigation"
  | "unknown";

/** Attribute / record-type cues that mean “look up a specific field”, not a module blurb. */
const RECORD_ATTRIBUTE_RE =
  /\b(call duration|duration|disposition|who handled|handled by|started|when did|called from|business number|caller phone|service level|avg wait|average wait|longest wait|how many runs|runs|status of|role does|what role)\b/;

/** Title-case proper names only — do NOT use the `i` flag on the Title Case arm. */
const TITLE_CASE_RECORD_RE =
  /\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z0-9][a-zA-Z0-9+/&-]*){1,})\b/;

const REFERENTIAL_RECORD_RE =
  /\b(this|that)\s+(call|queue|workflow|appointment|invoice|lead|deal)\b/i;

export type AvaIntent = {
  kind: AvaIntentKind;
  section: AccountSectionId | null;
  topic: string | null;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032']/g, "'")
    .replace(/[\u201C\u201D\u201E"]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\bwhats\s*app\b/g, "whatsapp");
}

/** Module-level nouns that must never be treated as entity names. */
export const MODULE_NAME_RE =
  /^(workflows?|locations?|integrations?|appointments?|calls?|queues?|call queues?|phone numbers?|numbers?|ai employees?|agents?|team|members?|crm|leads?|deals?|knowledge(?: base)?|documents?|faqs?|voice flows?|ivr|contact center|live monitor|sms(?: campaigns?)?|whatsapp|billing|invoices?|routing(?: rules)?|settings|analytics|roi|revenue|training|dashboard|overview)$/i;

export function isModuleNamePhrase(phrase: string): boolean {
  const cleaned = phrase
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an|my|our)\s+/i, "")
    .replace(/[?!.]+$/g, "")
    .trim();
  return MODULE_NAME_RE.test(cleaned);
}

function detectSection(question: string): AccountSectionId | null {
  const q = normalize(question);
  let best: AccountSectionId | null = null;
  let bestScore = 0;
  for (const meta of SECTION_META) {
    let score = 0;
    for (const keyword of meta.keywords) {
      if (q.includes(keyword)) {
        score += Math.max(1, Math.min(4, Math.ceil(keyword.length / 6)));
      }
    }
    if (meta.id === "workflows" && /\bworkflows?\b/.test(q)) score += 6;
    if (meta.id === "call_queues" && /\bqueues?\b/.test(q)) score += 4;
    if (score > bestScore) {
      bestScore = score;
      best = meta.id;
    }
  }
  return bestScore > 0 ? best : null;
}

function looksLikeInventoryQuestion(q: string): boolean {
  return (
    /^(what are|what(?:'s| is)|list|show|how many)\b/.test(q) &&
    /\b(published|draft|active|archived|we have|do we have|i have|\d+|list|which|named|total|count)\b/.test(
      q,
    ) &&
    // Status-filtered asks are metric_count / filtered_list, not inventory blurbs.
    !/\b(pending|confirmed|cancelled|canceled|no[\s-]?show|missed|answered|disconnected|open invoices?)\b/.test(
      q,
    )
  );
}

/** Status cues that imply a filtered count/list (not a named record like “Missed Call Follow-up”). */
function hasStatusFilterCue(q: string): boolean {
  if (
    /\b(pending|confirmed|cancelled|canceled|no[\s-]?show|answered|voicemail|disconnected|connected|needs? attention|published|draft|paused)\b/.test(
      q,
    )
  ) {
    return true;
  }
  if (/\bopen\b/.test(q) && /\binvoices?\b/.test(q)) return true;
  if (/\bpaid\b/.test(q) && /\binvoices?\b/.test(q)) return true;
  // Require “missed call(s)” as a filter phrase — not “Missed Call Follow-up”.
  if (/\bmissed calls?\b/.test(q)) return true;
  if (/\bcalls?\b/.test(q) && /\bmissed\b/.test(q) && !/\bfollow-?up\b/.test(q)) return true;
  return false;
}

function hasModuleCue(q: string): boolean {
  return /\b(appointments?|calls?|invoices?|integrations?|workflows?)\b/.test(q);
}

export function looksLikeFilteredDataQuestion(
  question: string,
  context?: ConversationContext | null,
): boolean {
  const q = normalize(question);
  // Named record / concept asks are not filtered lists.
  if (/^(tell me(?: about)?|describe|explain)\b/.test(q) && TITLE_CASE_RECORD_RE.test(question)) {
    return false;
  }
  if (
    context?.lastSection &&
    context.lastQueryOp &&
    ["list", "count"].includes(context.lastQueryOp) &&
    /\b(which one is next|what(?:'s| is) next|next (?:one|appointment)|those|them)\b/.test(q)
  ) {
    return true;
  }
  if (!hasStatusFilterCue(q)) return false;
  if (
    /\b(how many|how much|number of|count)\b/.test(q) &&
    (hasModuleCue(q) || context?.lastSection)
  ) {
    return true;
  }
  if (
    /\b(list|show|give me|which|display|what are the)\b/.test(q) &&
    (hasModuleCue(q) || context?.lastSection)
  ) {
    return true;
  }
  // Compact: "pending appointments" / "cancelled appointments"
  if (hasModuleCue(q) && hasStatusFilterCue(q)) return true;
  return false;
}

export function looksLikeRecordOrAttributeQuestion(
  question: string,
  context?: ConversationContext | null,
): boolean {
  const q = normalize(question);
  // Inventory / list asks are module summaries, not single-record lookups.
  if (looksLikeInventoryQuestion(q)) return false;
  if (looksLikeFilteredDataQuestion(question, context)) return false;

  if (RECORD_ATTRIBUTE_RE.test(q)) return true;

  if (TITLE_CASE_RECORD_RE.test(question) && !isModuleNamePhrase(question.replace(/[?!.]+$/g, ""))) {
    const bare = q
      .replace(/^(tell me(?: about)?|what(?:'s| is| are)|describe|explain)\s+(?:the\s+)?/, "")
      .replace(/[?!.]+$/g, "")
      .trim();
    if (!isModuleNamePhrase(bare)) return true;
  }

  // "this call" / "that workflow" only when we already have a prior record, or an attribute cue.
  if (REFERENTIAL_RECORD_RE.test(q)) {
    if (context?.lastEntityName || RECORD_ATTRIBUTE_RE.test(q)) return true;
  }

  if (
    context?.lastEntityName &&
    /\b(it|this|that|how long|who handled|what was|when did)\b/.test(q)
  ) {
    return true;
  }
  return false;
}

export function classifyAvaIntent(
  question: string,
  context?: ConversationContext | null,
): AvaIntent {
  const q = normalize(question);
  let section = detectSection(question) ?? context?.lastSection ?? null;

  const wantsBuild =
    /\b(help(?:\s+\w+){0,3}\s+)?(build(?:ing)?|creat(?:e|ing)|set(?:ting)?\s*up|make|add(?:ing)?)\b/.test(
      q,
    ) || /\b(similar|clone|copy|based on|like this|like that)\b.{0,40}\bworkflow/.test(q);
  const mentionsWorkflowish =
    /\b(workflow|automation|voice flow|routing rule)\b/.test(q) ||
    context?.lastEntityType?.toLowerCase().includes("workflow") ||
    context?.lastSection === "workflows";

  if (
    (/\b(help me|help us|how (?:do|can) i|how to|guide me|walk me through)\b/.test(q) &&
      wantsBuild) ||
    (wantsBuild && mentionsWorkflowish)
  ) {
    return {
      kind: "build_help",
      section:
        section ??
        (/\bvoice flow/.test(q)
          ? "voice_flows"
          : /\brouting/.test(q)
            ? "routing"
            : mentionsWorkflowish
              ? "workflows"
              : null),
      topic: /\b(similar|clone|copy|based on|like this|like that)\b/.test(q)
        ? "similar"
        : "build",
    };
  }

  if (
    /\b(how (?:can|do) (?:we|i|you) improve|how to improve|reach 100%|get to 100%|improve (?:this|it|that)|action plan|what should (?:we|i) do)\b/.test(
      q,
    )
  ) {
    return {
      kind: "optimize",
      section: section ?? context?.lastSection ?? "call_queues",
      topic: context?.lastMetric ?? "performance",
    };
  }

  const staffingWhy =
    /\b(6\s*(?:out of|\/)\s*8|out of \d+\s*agents?|agents?\s*(?:online|available|out of))\b/.test(q);
  const serviceWhy = /\b(service level|sla)\b/.test(q) && /\b(why|low|below|under)\b/.test(q);
  if (/\bwhy\b/.test(q) || staffingWhy || serviceWhy) {
    if (staffingWhy || serviceWhy || context?.lastEntityName || section === "call_queues") {
      return {
        kind: "diagnostic",
        section: section ?? "call_queues",
        topic: serviceWhy
          ? "serviceLevel"
          : staffingWhy
            ? "agentsOnline"
            : (context?.lastMetric ?? null),
      };
    }
  }

  if (
    /\b(where (?:do|can) i|which page|how do i (?:get|go|open|find)|take me to|navigate)\b/.test(q)
  ) {
    return { kind: "navigation", section, topic: null };
  }

  // Exact filtered count/list — never collapse into a module summary.
  if (looksLikeFilteredDataQuestion(question, context)) {
    if (!section) {
      if (/\bappointment/.test(q)) section = "appointments";
      else if (/\bcalls?\b/.test(q)) section = "calls";
      else if (/\binvoice/.test(q)) section = "invoices";
      else if (/\bintegration/.test(q)) section = "integrations";
      else if (/\bworkflow/.test(q)) section = "workflows";
      else section = context?.lastSection ?? null;
    }
    const status =
      /\bcancell|\bno[\s-]?show/.test(q)
        ? "cancelled"
        : /\bpending\b/.test(q)
          ? "pending"
          : /\bconfirmed\b/.test(q)
            ? "confirmed"
            : /\bmissed calls?\b/.test(q) ||
                (/\bmissed\b/.test(q) && /\bcalls?\b/.test(q) && !/\bfollow-?up\b/.test(q))
              ? "missed"
              : /\bdisconnected\b/.test(q)
                ? "disconnected"
                : /\bopen\b/.test(q)
                  ? "open"
                  : /\bpublished\b/.test(q)
                    ? "published"
                    : /\bdraft\b/.test(q)
                      ? "draft"
                      : context?.lastFilterStatus
                        ? String(
                            Array.isArray(context.lastFilterStatus)
                              ? context.lastFilterStatus[0]
                              : context.lastFilterStatus,
                          )
                        : null;
    const isCount = /\b(how many|how much|number of|count)\b/.test(q);
    const isNext = /\b(which one is next|what(?:'s| is) next|next (?:one|appointment))\b/.test(q);
    return {
      kind: isCount ? "metric_count" : "filtered_list",
      section,
      topic: isNext ? "next" : status,
    };
  }

  // Inventory / list questions disguised as "what are…"
  // e.g. "what are the 2 published workflows we have?"
  if (looksLikeInventoryQuestion(q) && section) {
    return { kind: "account_summary", section, topic: "list" };
  }

  // Record/attribute questions beat module keyword noise (e.g. "call duration" ≠ Calls/Locations dump).
  if (looksLikeRecordOrAttributeQuestion(question, context)) {
    if (/\b(call duration|duration|disposition|who handled|handled|called from|caller)\b/.test(q)) {
      section = "calls";
    } else if (/\b(service level|avg wait|longest wait|agents? (?:online|out of))\b/.test(q)) {
      section = "call_queues";
    } else if (/\b(how many runs|runs)\b/.test(q) && /\bworkflow\b/.test(q)) {
      section = "workflows";
    }
    return {
      kind: RECORD_ATTRIBUTE_RE.test(q) ? "record_attribute" : "entity_lookup",
      section,
      topic: context?.lastEntityName ?? null,
    };
  }

  // Pure concept only for bare module nouns: "what are workflows?"
  if (/^(what are|what is a|what is an)\b/.test(q)) {
    const rest = q
      .replace(/^(what are|what is a|what is an)\s+/, "")
      .replace(/[?!.]+$/g, "")
      .trim();
    if (isModuleNamePhrase(rest) || /^(a|an)\s+\w+/.test(rest)) {
      return { kind: "concept", section, topic: section };
    }
    if (section) return { kind: "account_summary", section, topic: "list" };
  }

  const afterWhat = q.replace(/^what(?:'s| is)\s+/, "");
  if (/^what(?:'s| is)\s+/.test(q) && section && isModuleNamePhrase(afterWhat)) {
    return { kind: "concept", section, topic: section };
  }

  if (/^(tell me(?: about)?|describe|explain)\b/.test(q)) {
    const after = question
      .replace(/^(tell me(?: about)?|describe|explain)\s+(?:the\s+)?/i, "")
      .replace(/\?+$/, "")
      .trim();
    if (section && (isModuleNamePhrase(after) || after.length < 3)) {
      return { kind: "module_summary", section, topic: section };
    }
  }

  // Bare "how many appointments?" (no status filter) → section summary/count overview.
  if (/\b(how many|how much|list my|show my|count|total)\b/.test(q)) {
    return { kind: "account_summary", section, topic: null };
  }

  if (
    context?.lastSection &&
    /\b(tell me more|more about (?:them|it|this|that)|same (?:for|about))\b/.test(q)
  ) {
    return { kind: "module_summary", section: context.lastSection, topic: context.lastSection };
  }

  if (
    /\b(in|for|of)\s+(?:the\s+)?[A-Z]/.test(question) ||
    /\b(Dental Support|Insurance|Noah|Mia)\b/i.test(question)
  ) {
    return { kind: "entity_lookup", section, topic: null };
  }

  if (section && /\b(my|our|account)\b/.test(q)) {
    return { kind: "account_summary", section, topic: null };
  }

  return { kind: "unknown", section, topic: null };
}
