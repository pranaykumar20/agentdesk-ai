import type { OrgContext } from "@/lib/auth";
import type { ChatMessage } from "@/lib/marketing/chat-agent";
import type { AvaCitation } from "./citations";
import { mergeCitations } from "./citations";
import {
  buildAccountEntityCatalog,
  type AccountEntity,
  type AccountEntityType,
} from "./entity-catalog";
import { isModuleNamePhrase } from "./intent";
import { formatUnsureSuggestions } from "./module-metrics";
import { resolvePageContext, type PageContext } from "./page-context";

export type EntityLookupAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  entity: AccountEntity | null;
  attribute: string | null;
};

type AttributeSpec = {
  key: string;
  aliases: string[];
  label: string;
};

const ATTRIBUTES: AttributeSpec[] = [
  {
    key: "durationLabel",
    aliases: [
      "call duration",
      "duration",
      "how long",
      "lasted",
      "length of the call",
      "length of call",
    ],
    label: "call duration",
  },
  {
    key: "disposition",
    aliases: ["disposition", "categorized as", "category", "reason for call"],
    label: "disposition",
  },
  {
    key: "agentName",
    aliases: [
      "who handled",
      "handled by",
      "which agent",
      "what agent",
      "agent who",
      "handled",
    ],
    label: "agent",
  },
  {
    key: "startedLabel",
    aliases: [
      "when did",
      "started",
      "start time",
      "called at",
      "call time",
      "when was",
    ],
    label: "start time",
  },
  {
    key: "callerPhone",
    aliases: [
      "called from",
      "caller phone",
      "caller number",
      "from number",
      "phone she called from",
      "phone he called from",
    ],
    label: "caller phone",
  },
  {
    key: "businessPhone",
    aliases: ["business number", "business phone", "called into", "to number"],
    label: "business number",
  },
  {
    key: "avgWaitLabel",
    aliases: [
      "avg wait",
      "average wait",
      "wait time",
      "avg wait time",
      "average wait time",
    ],
    label: "average wait",
  },
  {
    key: "longestWaitLabel",
    aliases: ["longest wait", "max wait", "longest wait time"],
    label: "longest wait",
  },
  {
    key: "callsInQueue",
    aliases: ["calls in queue", "queue depth", "in queue"],
    label: "calls in queue",
  },
  {
    key: "serviceLevel",
    aliases: ["service level", "sla", "sl"],
    label: "service level",
  },
  {
    key: "abandoned",
    aliases: ["abandoned", "abandons"],
    label: "abandoned calls",
  },
  {
    key: "abandonedRate",
    aliases: ["abandon rate", "abandoned rate"],
    label: "abandon rate",
  },
  {
    key: "accuracy",
    aliases: ["accuracy", "model accuracy", "score"],
    label: "accuracy",
  },
  {
    key: "status",
    aliases: ["status", "state", "lifecycle"],
    label: "status",
  },
  {
    key: "strategy",
    aliases: ["strategy", "routing strategy"],
    label: "strategy",
  },
  {
    key: "description",
    aliases: ["description", "what's the description", "whats the description"],
    label: "description",
  },
  {
    key: "highlights",
    aliases: [
      "special",
      "special about",
      "what's special",
      "whats special",
      "unique",
      "highlight",
      "highlights",
      "stands out",
      "what makes",
      "capabilities",
      "features",
    ],
    label: "highlights",
  },
  {
    key: "rating",
    aliases: ["rating", "stars"],
    label: "rating",
  },
  {
    key: "priceLabel",
    aliases: ["price", "cost", "pricing"],
    label: "price",
  },
  {
    key: "installs",
    aliases: ["installs", "install count"],
    label: "installs",
  },
  {
    key: "phone",
    aliases: ["phone", "phone number", "number"],
    label: "phone",
  },
  {
    key: "datasetName",
    aliases: ["dataset", "data set"],
    label: "dataset",
  },
  {
    key: "agentName",
    aliases: ["agent", "ai agent", "employee"],
    label: "agent",
  },
  {
    key: "agentsOnline",
    aliases: [
      "agents online",
      "online agents",
      "agents available",
      "available agents",
      "agents out of",
      "out of",
    ],
    label: "agents online",
  },
  {
    key: "agentsTotal",
    aliases: ["agents total", "assigned agents", "total agents"],
    label: "agents assigned",
  },
  {
    key: "runs",
    aliases: ["how many runs", "run count", "runs", "number of runs"],
    label: "runs",
  },
];

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\bwhats\s*app\b/g, "whatsapp");
}

function cleanPhrase(raw: string): string {
  return raw
    .replace(/[?!.]+$/g, "")
    .replace(/^(the|a|an|my|our)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Stopwords that are not entity names when alone. */
const NOISE = new Set([
  "how",
  "many",
  "much",
  "what",
  "whats",
  "tell",
  "me",
  "about",
  "show",
  "list",
  "the",
  "a",
  "an",
  "my",
  "our",
  "in",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "do",
  "i",
  "have",
  "avg",
  "average",
  "wait",
  "time",
  "status",
  "accuracy",
  "special",
  "unique",
  "highlight",
  "highlights",
  "features",
  "capabilities",
  "it",
  "this",
  "that",
  "them",
  "him",
  "her",
]);

/** Follow-ups that refer to the last discussed entity ("what's special about it?"). */
export function isReferentialFollowUp(question: string): boolean {
  const q = normalize(question);
  if (
    !/\b(it|this|that|them|him|her|this one|that one|the same|the call|that call)\b/.test(
      q,
    )
  ) {
    // Short attribute follow-ups with no new name: "how long was it?", "who handled it?"
    if (
      /\b(how long|who handled|what was the disposition|when did)\b/.test(q) &&
      !/[A-Z][a-z]+\s+[A-Z]/.test(question)
    ) {
      return true;
    }
    return false;
  }
  // Explicit new names win over pronouns: "compare it to Dental Support"
  if (/\b(vs|versus|compared to|compare to)\b/.test(q)) return false;
  return true;
}

/**
 * Pull the last entity name Ava (or the user) mentioned from chat history.
 * Prefers assistant entity cards like "**Noah - Appointment Setter** — AI Employee".
 */
export function resolvePriorEntityName(
  messages: ChatMessage[] | undefined,
): string | null {
  if (!messages?.length) return null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg?.content?.trim()) continue;

    if (msg.role === "assistant") {
      if (/couldn'?t find/i.test(msg.content)) continue;
      if (/did you mean/i.test(msg.content) && /few matches/i.test(msg.content)) continue;

      const card = msg.content.match(
        /^\*\*([^*]+)\*\*\s*(?:—|-|–)\s*[^\n]+/m,
      );
      if (card?.[1]) {
        const name = cleanPhrase(card[1]);
        if (name.length >= 3 && !NOISE.has(normalize(name))) return name;
      }

      const attrLine = msg.content.match(
        /^\*\*([^*]+)\*\*\s+(?:average wait|status|accuracy|highlights|description|[a-z ]+)\s+is\s+\*\*/im,
      );
      if (attrLine?.[1]) {
        const name = cleanPhrase(attrLine[1]);
        if (name.length >= 3) return name;
      }
    }

    if (msg.role === "user") {
      if (isReferentialFollowUp(msg.content)) continue;
      const candidate = extractEntityNameCandidate(msg.content);
      if (candidate && !isPronounishName(candidate)) return candidate;
    }
  }

  return null;
}

function isPronounishName(name: string): boolean {
  const n = normalize(name);
  if (/^(it|this|that|them|him|her|this one|that one)$/.test(n)) return true;
  // "this Sarah Johnson" is a real name with a determiner — strip and re-check.
  const stripped = n.replace(/^(this|that|the)\s+/, "");
  if (stripped !== n) {
    if (stripped.split(/\s+/).length >= 2 && !NOISE.has(stripped)) return false;
  }
  if (/\b(it|this|that)\b/.test(n) && n.split(/\s+/).length <= 2) return true;
  if (NOISE.has(n)) return true;
  const tokens = n.split(/\s+/);
  if (tokens.length > 0 && tokens.every((t) => NOISE.has(t))) return true;
  return false;
}

/** Strip attribute / filler phrases so we keep the person or record name. */
function sanitizeNameCandidate(raw: string): string {
  let name = cleanPhrase(raw);
  name = name
    .replace(/^(this|that|the)\s+/i, "")
    .replace(/^(call\s+)?duration\s+of\s+(this\s+|that\s+|the\s+)?/i, "")
    .replace(
      /^(the\s+)?(call\s+)?(duration|disposition|status|agent|phone|number)\s+(of\s+)?(this\s+|that\s+|the\s+)?/i,
      "",
    )
    .replace(/\b(call duration|service level)\b/gi, " ")
    // Only strip trailing type words, not "Call" inside names like "Missed Call Follow-up"
    .replace(/\s+(call|appointment|workflow|queue)s?\s*$/i, "")
    .replace(/^(avg|average)\s+wait(?:\s+time)?\s+(?:in|for|on)\s+/i, "")
    .replace(/^(special|unique|highlights?|features?|capabilities)\s+about\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  name = name.replace(/['’]s$/i, "").trim();
  return name;
}

function looksLikeAttributeBlob(name: string): boolean {
  const n = normalize(name);
  return (
    /^(how long|who handled|what was|when did|how many)/.test(n) ||
    /\b(was it|is it|did it)\b/.test(n) ||
    n.split(/\s+/).length <= 4 &&
      /^(how|who|what|when|why)\b/.test(n) &&
      !/[a-z]+\s+[a-z]+/.test(n.replace(/^(how|who|what|when|why)\s+/, ""))
  );
}

export function extractAttribute(question: string): AttributeSpec | null {
  const q = normalize(question);
  let best: AttributeSpec | null = null;
  let bestLen = 0;
  for (const attr of ATTRIBUTES) {
    for (const alias of attr.aliases) {
      if (q.includes(alias) && alias.length > bestLen) {
        best = attr;
        bestLen = alias.length;
      }
    }
  }
  return best;
}

/**
 * Try to pull an entity name phrase from the question.
 * Prefers "in/for/of X", "tell me X", Title Case spans, and quoted names.
 */
export function extractEntityNameCandidate(question: string): string | null {
  const original = question.trim();
  const q = normalize(question);

  const quoted = original.match(/["'“”](.+?)["'“”]/);
  if (quoted?.[1] && cleanPhrase(quoted[1]).length >= 3) {
    return sanitizeNameCandidate(quoted[1]);
  }

  // Prefer the longest Title Case name (e.g. "Missed Call Follow-up" over shorter fragments).
  const titleCases = [
    ...original.matchAll(/\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z0-9][a-zA-Z0-9+/&-]*)+)\b/g),
  ].map((m) => m[1]!);
  titleCases.sort((a, b) => b.length - a.length);
  for (const tc of titleCases) {
    const name = sanitizeNameCandidate(tc);
    if (name.length >= 3 && !isPronounishName(name) && !isModuleNamePhrase(name)) {
      if (!/^(call duration|service level|office hours)$/i.test(name)) {
        return name;
      }
    }
  }

  // Possessive: "Sarah Johnson's call duration"
  const possessive = original.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})['’]s\b/,
  );
  if (possessive?.[1]) {
    const name = sanitizeNameCandidate(possessive[1]);
    if (name.length >= 3 && !isModuleNamePhrase(name)) return name;
  }

  const patterns = [
    /(?:avg|average)\s+wait(?:\s+time)?\s+(?:in|for|on)\s+(?:the\s+)?(.+)$/i,
    /(?:call\s+)?duration\s+of\s+(?:this\s+|that\s+|the\s+)?(.+)$/i,
    /(?:wait(?:\s+time)?|accuracy|status|rating|price|disposition|duration)\s+(?:in|for|of|on)\s+(?:this\s+|that\s+|the\s+)?(.+)$/i,
    /(?:in|for|on)\s+(?:the\s+)?(.+?)(?:\s+queue|\s+bot|\s+training|\s+call)?\s*\??$/i,
    /(?:^|[\s,])of\s+(?:this\s+|that\s+|the\s+)?([A-Za-z][A-Za-z0-9+/&\- ]{2,}?)(?:\s+queue|\s+bot|\s+training|\s+call)?\s*\??$/i,
    /^(?:tell me(?: about)?|what(?:'s| is)|describe|show me)\s+(?:the\s+)?(.+?)\s*\??$/i,
    /^(.+?)\s+(?:queue|bot|training|agent|employee|integration|workflow|call)\s*\??$/i,
  ];

  for (const pattern of patterns) {
    const match = original.match(pattern);
    if (!match?.[1]) continue;
    let name = sanitizeNameCandidate(match[1]);
    if (name.length < 3) continue;
    if (isPronounishName(name)) continue;
    if (isModuleNamePhrase(name)) continue;
    if (/^\d+(\.\d+)?(\s*%|\s*agents?)?$/i.test(name)) continue;
    if (/^out of\b/i.test(name)) continue;
    const tokens = normalize(name).split(/\s+/);
    if (tokens.every((t) => NOISE.has(t))) continue;
    // Reject leftover attribute blobs
    if (/\b(duration|disposition|service level)\b/i.test(name) && tokens.length > 3) continue;
    return name;
  }

  // Last resort: if question is mostly a name ("Dental FAQ Training")
  const stripped = cleanPhrase(
    q
      .replace(
        /\b(what is|what's|whats|tell me about|tell me|show me|describe|avg wait in|average wait in|the)\b/g,
        " ",
      )
      .replace(
        /\b(special|unique|highlights?|features?|capabilities)\s+about\b/g,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim(),
  );
  if (
    stripped.split(/\s+/).length >= 2 &&
    stripped.length >= 6 &&
    !isPronounishName(stripped)
  ) {
    return stripped;
  }

  return null;
}

function scoreMatch(entity: AccountEntity, query: string): number {
  const q = normalize(query);
  const name = normalize(entity.name);
  if (!q || !name) return 0;
  if (name === q) return 100;
  // Avoid short fragments like "team" matching "Billing Team" via includes.
  const qTokenCount = q.split(/\s+/).filter(Boolean).length;
  if (qTokenCount >= 2 && (name.includes(q) || q.includes(name))) return 85;
  if (qTokenCount === 1 && name === q) return 100;

  const aliasHit = entity.aliases.some((a) => {
    const n = normalize(a);
    if (!n) return false;
    // Don't match phone-number aliases against person-name queries.
    if (/\d{3}/.test(n) && !/\d{3}/.test(q)) return false;
    if (n === q) return true;
    // Short category/tag aliases ("automation") must not match inside
    // longer feature phrases ("whatsapp automation").
    const aliasTokens = n.split(/\s+/).filter(Boolean);
    if (
      aliasTokens.length === 1 &&
      n.length <= 14 &&
      qTokenCount >= 2 &&
      q.includes(n) &&
      q !== n
    ) {
      return false;
    }
    if (qTokenCount >= 2 && (n.includes(q) || q.includes(n))) return true;
    return false;
  });
  if (aliasHit) return 70;

  const qTokens = q.split(/\s+/).filter((t) => t.length > 1 && !NOISE.has(t));
  const nameTokens = name.split(/\s+/);
  if (qTokens.length === 0) return 0;
  const overlap = qTokens.filter((t) =>
    nameTokens.some((n) => n === t || n.startsWith(t) || t.startsWith(n)),
  ).length;
  const ratio = overlap / qTokens.length;
  if (ratio >= 0.8 && qTokens.length >= 2) return 60 + Math.round(ratio * 20);
  if (ratio >= 0.5 && qTokens.length >= 2) return 40 + Math.round(ratio * 15);
  return 0;
}

function preferTypeBoost(question: string, type: AccountEntityType): number {
  const q = normalize(question);
  let boost = 0;
  if (/\bqueue\b/.test(q) && type === "call_queue") boost += 20;
  if (/\b(bot|marketplace)\b/.test(q) && type === "marketplace_agent") boost += 15;
  if (/\btraining\b/.test(q) && type === "training_job") boost += 15;
  if (/\b(ai employee)\b/.test(q) && type === "ai_employee") boost += 15;
  if (/\bintegration\b/.test(q) && type === "integration") boost += 15;
  if (/\bworkflow\b/.test(q) && type === "workflow") boost += 20;
  if (/\bwhatsapp\b/.test(q) && type === "whatsapp_workflow") boost += 20;
  if (/\bworkflow\b/.test(q) && type === "whatsapp_workflow" && !/\bwhatsapp\b/.test(q)) {
    boost -= 15;
  }
  if (/\bwhatsapp\b/.test(q) && type.startsWith("whatsapp")) boost += 12;
  if (/\blocation\b/.test(q) && type === "location") boost += 15;
  if (/\bappointment\b/.test(q) && type === "appointment") boost += 20;
  if (/\b(team member|role does|what role)\b/.test(q) && type === "team_member") boost += 20;
  if (/\binvoice\b/.test(q) && type === "invoice") boost += 20;

  // Call-specific language strongly prefers call records.
  if (
    /\b(call duration|duration|disposition|who handled|handled|caller|called|answered|missed|voicemail)\b/.test(
      q,
    ) ||
    /\b(call|caller)\b/.test(q)
  ) {
    if (type === "call") boost += 35;
    if (type === "location" || type === "phone_number") boost -= 40;
    if (type === "team_member") boost -= 10;
  }

  return boost;
}

function pageTypeBoost(page: PageContext | null, type: AccountEntityType): number {
  if (!page) return 0;
  const map: Partial<Record<PageContext["area"], AccountEntityType[]>> = {
    calls: ["call"],
    appointments: ["appointment"],
    "call-queues": ["call_queue"],
    workflows: ["workflow"],
    "voice-flows": ["voice_flow"],
    "ai-employees": ["ai_employee"],
    team: ["team_member"],
    locations: ["location"],
    "phone-numbers": ["phone_number"],
    integrations: ["integration"],
    crm: ["crm_deal"],
    knowledge: ["knowledge_doc"],
    billing: ["invoice"],
    training: ["training_job"],
    whatsapp: ["whatsapp_conversation", "whatsapp_workflow"],
  };
  const preferred = map[page.area];
  if (!preferred) return 0;
  return preferred.includes(type) ? 25 : 0;
}

function attributeTypeBoost(
  attribute: AttributeSpec | null,
  type: AccountEntityType,
): number {
  if (!attribute) return 0;
  const callAttrs = new Set([
    "durationLabel",
    "disposition",
    "agentName",
    "startedLabel",
    "callerPhone",
    "businessPhone",
  ]);
  if (callAttrs.has(attribute.key)) {
    if (type === "call") return 30;
    if (type === "location" || type === "phone_number") return -50;
  }
  if (attribute.key === "serviceLevel" || attribute.key === "avgWaitLabel") {
    return type === "call_queue" ? 25 : type === "location" ? -20 : 0;
  }
  if (attribute.key === "runs" || attribute.key === "steps") {
    return type === "workflow" ? 25 : 0;
  }
  return 0;
}

function formatFieldValue(key: string, value: string | number | boolean | null): string {
  if (value == null) return "—";
  if (key === "serviceLevel" || key === "accuracy" || key === "abandonedRate") {
    return typeof value === "number" ? `${value}%` : String(value);
  }
  if (key === "valueCents" && typeof value === "number") {
    return `$${(value / 100).toLocaleString()}`;
  }
  if (key === "durationLabel" || key === "durationSeconds") {
    if (typeof value === "number") {
      const m = Math.floor(value / 60);
      const s = Math.round(value % 60);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
  }
  return String(value);
}

function formatHighlights(entity: AccountEntity): string {
  const lines = [`**${entity.name}** — what’s special:`, ""];
  const description = entity.fields.description;
  if (description) lines.push(String(description), "");

  const bullets: Array<[string, string | number | boolean | null | undefined]> = [
    ["Role", entity.fields.roleTitle],
    ["Department", entity.fields.department],
    ["Personality", entity.fields.personality],
    ["Voice", entity.fields.voice],
    ["Tags", entity.fields.tags],
    ["Capabilities", entity.fields.capabilities],
    ["Category", entity.fields.category],
    ["Price", entity.fields.priceLabel],
  ];

  for (const [label, value] of bullets) {
    if (value == null || value === "") continue;
    if (label === "Capabilities") {
      const parts = String(value)
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) {
        lines.push("- **Capabilities:**");
        for (const part of parts) lines.push(`  - ${part}`);
        continue;
      }
    }
    lines.push(`- **${label}:** ${value}`);
  }

  if (lines.length <= 2) {
    lines.push("No extra highlight fields are stored for this record yet.");
  }

  lines.push("", `Open **${entity.path}** for the full record.`);
  return lines.join("\n");
}

function formatEntityCard(entity: AccountEntity, attribute: AttributeSpec | null): string {
  if (attribute?.key === "highlights") {
    return formatHighlights(entity);
  }

  const lines: string[] = [];
  const description = entity.fields.description;

  // Attribute ask: answer it when present; otherwise fall through to a full card (never a dead-end).
  let attributeAnswered = false;
  if (attribute) {
    const raw =
      entity.fields[attribute.key] ??
      entity.fields[attribute.key.replace(/Label$/, "")] ??
      null;
    if (raw != null && raw !== "") {
      if (entity.type === "call" && attribute.key === "durationLabel") {
        lines.push(
          `**${entity.name}**’s call duration was **${formatFieldValue(attribute.key, raw)}**.`,
        );
      } else if (entity.type === "call") {
        lines.push(
          `**${entity.name}**’s ${attribute.label} was **${formatFieldValue(attribute.key, raw)}**.`,
        );
      } else {
        lines.push(
          `**${entity.name}** ${attribute.label} is **${formatFieldValue(attribute.key, raw)}**.`,
        );
      }
      attributeAnswered = true;
    }
  }

  if (!attributeAnswered) {
    lines.push(`**${entity.name}** — ${entity.label}`);
  }

  lines.push("");

  if (description && attribute?.key !== "description") {
    lines.push(String(description), "");
  }

  const preferredKeys = [
    "durationLabel",
    "disposition",
    "agentName",
    "startedLabel",
    "callerPhone",
    "businessPhone",
    "avgWaitLabel",
    "longestWaitLabel",
    "callsInQueue",
    "agentsOnline",
    "agentsTotal",
    "serviceLevel",
    "abandoned",
    "abandonedRate",
    "status",
    "strategy",
    "runs",
    "steps",
    "accuracy",
    "datasetName",
    "source",
    "serviceName",
    "providerName",
    "startsLabel",
    "role",
    "description",
    "category",
    "rating",
    "priceLabel",
    "installs",
    "phone",
    "lifecycleStatus",
    "roleTitle",
    "department",
    "personality",
    "capabilities",
    "tags",
    "queueType",
  ];

  const shown = new Set<string>();
  if (attributeAnswered && attribute) shown.add(attribute.key);
  // Description already rendered as prose above
  if (description && attribute?.key !== "description") shown.add("description");

  for (const key of preferredKeys) {
    if (shown.has(key)) continue;
    const value = entity.fields[key];
    if (value == null || value === "") continue;
    const label = key
      .replace(/Label$/, "")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
    lines.push(`- **${label}:** ${formatFieldValue(key, value)}`);
    shown.add(key);
    if (shown.size >= 10) break;
  }

  if (entity.type === "call" && !attributeAnswered) {
    // Direct summary when asking about the call generally.
    return [
      `**${entity.name}**’s call was **${entity.fields.status ?? "—"}**` +
        (entity.fields.agentName ? ` by **${entity.fields.agentName}**` : "") +
        (entity.fields.startedLabel ? ` on **${entity.fields.startedLabel}**` : "") +
        `.`,
      "",
      entity.fields.durationLabel
        ? `The call lasted **${entity.fields.durationLabel}**` +
          (entity.fields.disposition
            ? ` and was categorized as **${entity.fields.disposition}**.`
            : ".")
        : entity.fields.disposition
          ? `Disposition: **${entity.fields.disposition}**.`
          : null,
      entity.fields.callerPhone
        ? `- **Caller phone:** ${entity.fields.callerPhone}`
        : null,
      entity.fields.businessPhone
        ? `- **Business number:** ${entity.fields.businessPhone}`
        : null,
      "",
      `Open **${entity.path}** for the full record.`,
    ]
      .filter((line) => line != null)
      .join("\n");
  }

  // Light interpretation for workflows / queues so follow-ups feel dynamic.
  if (entity.type === "workflow") {
    const status = entity.fields.status;
    const runs = entity.fields.runs;
    lines.push("");
    if (status === "published") {
      lines.push(
        `**Interpretation:** This workflow is live${runs != null ? ` and has run **${Number(runs).toLocaleString()}** times` : ""}. You can edit steps, add conditions, or clone it for a related automation.`,
      );
    } else if (status === "draft") {
      lines.push(
        "**Interpretation:** This is still a draft — publish it when the trigger/actions look right, or ask me to help refine the flow.",
      );
    }
    lines.push(
      "",
      "Ask me how it works, how to improve it, or help building a similar workflow.",
    );
  }

  if (entity.type === "call_queue") {
    const sl = entity.fields.serviceLevel;
    const online = entity.fields.agentsOnline;
    const total = entity.fields.agentsTotal;
    if (sl != null || (online != null && total != null)) {
      lines.push("");
      lines.push(
        "**Interpretation:** Ask why staffing or service level looks off, or how to improve this queue — I’ll use these live metrics.",
      );
    }
  }

  lines.push("", `Open **${entity.path}** for the full record.`);
  return lines.join("\n");
}

export async function lookupEntity(
  ctx: OrgContext,
  question: string,
  options?: {
    name?: string;
    attribute?: string;
    priorMessages?: ChatMessage[];
    pathname?: string | null;
  },
): Promise<EntityLookupAnswer | null> {
  const attribute =
    (options?.attribute
      ? ATTRIBUTES.find(
          (a) =>
            a.key === options.attribute ||
            a.aliases.includes(normalize(options.attribute!)),
        )
      : null) ?? extractAttribute(question);

  const page = resolvePageContext(options?.pathname ?? null);

  let nameCandidate = options?.name?.trim() || extractEntityNameCandidate(question);
  if (nameCandidate) nameCandidate = sanitizeNameCandidate(nameCandidate);
  if (nameCandidate && (isPronounishName(nameCandidate) || looksLikeAttributeBlob(nameCandidate))) {
    nameCandidate = null;
  }

  // Prefer conversational memory for follow-ups ("how long was it?", "who handled it?").
  if (isReferentialFollowUp(question)) {
    const prior = resolvePriorEntityName(options?.priorMessages);
    if (prior) nameCandidate = prior;
  } else if (!nameCandidate && isReferentialFollowUp(question)) {
    const prior = resolvePriorEntityName(options?.priorMessages);
    if (prior) nameCandidate = prior;
  }

  if (!nameCandidate) return null;
  if (isModuleNamePhrase(nameCandidate)) return null;

  // Inventory / roster / usage questions stay on the section router.
  const q = normalize(question);
  if (
    /\b(how many|how much|list my|show my|who'?s on|who is on|plan usage|my plan|minutes used|minutes included)\b/.test(
      q,
    )
  ) {
    return null;
  }
  if (/\bwhat(?:'s| is) my\b/.test(q) && !/\b(in|for)\s+(the\s+)?[a-z0-9]/i.test(question)) {
    return null;
  }
  if (
    !options?.name &&
    /\b(how many|list|show my|total)\b/.test(q) &&
    !attribute &&
    !/\b(in|for)\s+(the\s+)?[a-z0-9]/i.test(question)
  ) {
    return null;
  }

  const catalog = await buildAccountEntityCatalog(ctx);
  const ranked = catalog
    .map((entity) => ({
      entity,
      score:
        scoreMatch(entity, nameCandidate) +
        preferTypeBoost(question, entity.type) +
        pageTypeBoost(page, entity.type) +
        attributeTypeBoost(attribute, entity.type),
    }))
    .filter((r) => r.score >= 40)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    // Only claim "not found" when the question clearly looks entity-oriented.
    const looksEntity =
      Boolean(attribute) ||
      /^(tell me|what(?:'s| is)|describe)\b/i.test(question.trim()) ||
      /\b(queue|bot|training|agent)\b/i.test(question);
    if (!looksEntity) return null;

    const suggestions = catalog
      .map((entity) => ({ entity, score: scoreMatch(entity, nameCandidate) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      entity: null,
      attribute: attribute?.key ?? null,
      toolsUsed: ["entity_lookup", "clarify"],
      citations: [],
      reply: [
        `I couldn’t find **${nameCandidate}** in your account.`,
        "",
        ...(suggestions.length
          ? [
              "I did find these nearby matches — what would you like me to check?",
              ...suggestions.map((s) => `- **${s.entity.name}** (${s.entity.label})`),
              "",
            ]
          : []),
        formatUnsureSuggestions({
          pathname: options?.pathname,
          foundLabels: suggestions.map(
            (s) => `**${s.entity.name}** (${s.entity.label}) on ${s.entity.path}`,
          ),
        }),
      ].join("\n"),
    };
  }

  // Prefer core workflow over WhatsApp workflow twin unless user/page says WhatsApp.
  {
    const a = ranked[0];
    const b = ranked[1];
    if (
      a &&
      b &&
      a.entity.name === b.entity.name &&
      ((a.entity.type === "whatsapp_workflow" && b.entity.type === "workflow") ||
        (a.entity.type === "workflow" && b.entity.type === "whatsapp_workflow"))
    ) {
      const preferWa = /\bwhatsapp\b/.test(q) || page?.area === "whatsapp";
      const workflowHit = ranked.find((r) => r.entity.type === "workflow");
      const waHit = ranked.find((r) => r.entity.type === "whatsapp_workflow");
      if (!preferWa && workflowHit) {
        ranked.splice(0, ranked.length, workflowHit, ...ranked.filter((r) => r !== workflowHit));
      } else if (preferWa && waHit) {
        ranked.splice(0, ranked.length, waHit, ...ranked.filter((r) => r !== waHit));
      }
    }
  }

  const top = ranked[0]!;
  const second = ranked[1];

  // Ambiguity across modules (e.g. Call vs Team Member) — ask only when close in score.
  if (
    second &&
    top.score - second.score < 12 &&
    top.entity.type !== second.entity.type &&
    !(top.entity.type === "workflow" && second.entity.type === "whatsapp_workflow") &&
    !(top.entity.type === "whatsapp_workflow" && second.entity.type === "workflow") &&
    scoreMatch(top.entity, nameCandidate) >= 70 &&
    scoreMatch(second.entity, nameCandidate) >= 70
  ) {
    return {
      entity: null,
      attribute: attribute?.key ?? null,
      toolsUsed: ["entity_lookup"],
      citations: mergeCitations(
        ranked.slice(0, 3).map((r) => ({
          label: r.entity.label,
          path: r.entity.path,
          tool: "entity_lookup",
        })),
      ),
      reply: [
        `I found **${nameCandidate}** in more than one place. Did you mean:`,
        "",
        ...ranked
          .slice(0, 3)
          .map((r) => `- The **${r.entity.label}** record (**${r.entity.name}**) — ${r.entity.path}`),
      ].join("\n"),
    };
  }
  if (second && top.score - second.score < 8 && top.score < 90) {
    return {
      entity: null,
      attribute: attribute?.key ?? null,
      toolsUsed: ["entity_lookup"],
      citations: mergeCitations(
        ranked.slice(0, 3).map((r) => ({
          label: r.entity.label,
          path: r.entity.path,
          tool: "entity_lookup",
        })),
      ),
      reply: [
        `I found a few matches for **${nameCandidate}**. Which one did you mean?`,
        "",
        ...ranked.slice(0, 3).map((r) => `- **${r.entity.name}** (${r.entity.label})`),
      ].join("\n"),
    };
  }

  const entity = top.entity;
  return {
    entity,
    attribute: attribute?.key ?? null,
    toolsUsed: ["entity_lookup"],
    citations: [
      {
        label: entity.label,
        path: entity.path,
        tool: "entity_lookup",
      },
    ],
    reply: formatEntityCard(entity, attribute),
  };
}

/** True when the question likely names a specific account entity. */
export function looksLikeEntityQuestion(question: string): boolean {
  if (extractEntityNameCandidate(question) && extractAttribute(question)) return true;
  if (/^(tell me|describe|what(?:'s| is))\b/i.test(question.trim())) {
    return Boolean(extractEntityNameCandidate(question));
  }
  // Bare Title Case entity names typed as the whole message
  return Boolean(
    question.trim().match(/^[A-Z][a-zA-Z0-9+/&-]*(?:\s+[A-Z0-9][a-zA-Z0-9+/&-]*)+$/),
  );
}
