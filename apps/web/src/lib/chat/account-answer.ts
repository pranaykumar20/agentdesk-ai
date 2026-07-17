import type { OrgContext } from "@/lib/auth";
import type { AvaCitation } from "./citations";
import { citationsForPathname, mergeCitations } from "./citations";
import { resolvePageContext } from "./page-context";
import {
  ACCOUNT_SECTIONS,
  fetchAccountOverview,
  fetchAccountSection,
  formatSectionReply,
  SECTION_META,
  type AccountSectionId,
} from "./account-sections";
import { extractContactLookup, lookupContact } from "./contact-lookup";
import type { ChatMessage } from "@/lib/marketing/chat-agent";
import { lookupEntity } from "./entity-lookup";
import { buildConversationContext } from "./conversation-context";
import {
  classifyAvaIntent,
  isModuleNamePhrase,
  looksLikeFilteredDataQuestion,
  looksLikeRecordOrAttributeQuestion,
  type AvaIntent,
} from "./intent";
import {
  formatBuildWorkflowReply,
  formatConceptReply,
  formatSimilarWorkflowReply,
  getModuleKnowledge,
} from "./product-knowledge";
import { detectDiagnosticFocus, reasonAboutEntity } from "./metric-reasoning";
import {
  answerModuleMetric,
  formatUnsureSuggestions,
  looksLikeModuleMetricQuestion,
} from "./module-metrics";
import { buildAvaQueryPlan, isExactDataPlan } from "./query-planner";
import { executeAvaQueryPlan } from "./query-executor";

export type AccountAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  model: "account-context";
  sections: AccountSectionId[];
};

function normalizeQuestion(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032']/g, "'")
    .replace(/[\u201C\u201D\u201E"]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\binvocies?\b/g, "invoices")
    .replace(/\bwhats\s*app\b/g, "whatsapp");
}

function looksLikeAccountQuestion(q: string): boolean {
  return (
    /\b(how many|how much|what's|whats|what is|what are|show|list|tell me|do i have|are there|were there|count|total|my|our|why|improve|help me|build)\b/.test(
      q,
    ) ||
    /\b(call|appointment|invoice|billing|team|crm|lead|integration|phone|workflow|location|knowledge|roi|queue|sms|whatsapp|training|routing|settings)\b/.test(
      q,
    )
  );
}

function pageAreaToSection(area: string | undefined): AccountSectionId | null {
  switch (area) {
    case "home":
    case "analytics":
      return "overview";
    case "revenue":
      return "roi";
    case "calls":
      return "calls";
    case "appointments":
      return "appointments";
    case "crm":
      return "crm";
    case "ai-employees":
      return "ai_employees";
    case "billing":
      return "billing";
    case "team":
      return "team";
    case "integrations":
      return "integrations";
    case "knowledge":
      return "knowledge";
    case "settings":
      return "settings";
    case "phone-numbers":
      return "phone_numbers";
    case "locations":
      return "locations";
    case "workflows":
      return "workflows";
    case "voice-flows":
      return "voice_flows";
    case "contact-center":
      return "contact_center";
    case "live-monitor":
      return "live_monitor";
    case "call-queues":
      return "call_queues";
    case "sms":
      return "sms";
    case "whatsapp":
      return "whatsapp";
    case "training":
      return "training";
    case "routing":
      return "routing";
    default:
      return null;
  }
}

/** Score sections by keyword hits in the normalized question. */
export function detectAccountSections(question: string): AccountSectionId[] {
  const q = normalizeQuestion(question);
  const scores = new Map<AccountSectionId, number>();

  for (const meta of SECTION_META) {
    let score = 0;
    for (const keyword of meta.keywords) {
      if (q.includes(keyword)) {
        score += Math.max(1, Math.min(4, Math.ceil(keyword.length / 6)));
      }
    }
    if (meta.id === "invoices" && /\binvoices?\b/.test(q)) score += 5;
    if (meta.id === "billing" && /\binvoices?\b/.test(q) && !/\b(plan|minutes|usage)\b/.test(q)) {
      score = Math.max(0, score - 3);
    }
    if (meta.id === "phone_numbers" && /\bphone numbers?\b/.test(q)) score += 5;
    if (meta.id === "calls" && /\b(missed|answered|voicemail)/.test(q)) score += 3;
    if (meta.id === "whatsapp" && /\bwhatsapp\b/.test(q)) score += 10;
    if (meta.id === "sms" && /\bsms\b/.test(q)) score += 10;
    if (meta.id === "workflows" && /\bworkflows?\b/.test(q)) score += 6;
    if (
      meta.id === "contact_center" &&
      /\b(whatsapp|sms)\b/.test(q) &&
      !/\bcontact center\b/.test(q)
    ) {
      score = 0;
    }
    if (score > 0) scores.set(meta.id, score);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return [];

  const isCountQuestion = /\b(how many|how much|count|total)\b/.test(q);
  if (isCountQuestion) return [ranked[0][0]];

  const top = ranked[0];
  if (top[1] >= 10) return [top[0]];

  return ranked.slice(0, 2).map(([id]) => id);
}

async function accountLineForSection(
  ctx: OrgContext,
  section: AccountSectionId,
): Promise<{ line: string; citations: AvaCitation[]; toolsUsed: string[] } | null> {
  const result = await fetchAccountSection(ctx, section);
  if (!result.ok || result.denied) return null;
  const formatted = formatSectionReply(result);
  // First non-empty content line as compact account data
  const first = formatted
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("Open **"));
  return {
    line: first ? `**In your account:** ${first.replace(/^Workflows:\s*/i, "Workflows — ")}` : formatted,
    citations: result.citations,
    toolsUsed: [`section:${section}`],
  };
}

async function answerModuleConceptOrSummary(
  ctx: OrgContext,
  intent: AvaIntent,
  pageCitations: AvaCitation[],
): Promise<AccountAnswer | null> {
  const section = intent.section;
  if (!section) return null;
  const knowledge = getModuleKnowledge(section);
  if (!knowledge) return null;

  const account = await accountLineForSection(ctx, section);
  const conceptFirst = intent.kind === "concept";
  const reply = formatConceptReply(
    knowledge,
    account?.line ??
      (conceptFirst
        ? null
        : "I couldn’t load live metrics for this module right now — open the page for the latest numbers."),
  );

  return {
    model: "account-context",
    reply,
    citations: mergeCitations([
      ...pageCitations,
      { label: knowledge.name, path: knowledge.path, tool: "product_knowledge" },
      ...(account?.citations ?? []),
    ]),
    toolsUsed: ["product_knowledge", ...(account?.toolsUsed ?? [])],
    sections: [section],
  };
}

async function answerBuildHelp(
  ctx: OrgContext,
  intent: AvaIntent,
  pageCitations: AvaCitation[],
  priorMessages?: ChatMessage[],
  userMessage?: string,
): Promise<AccountAnswer | null> {
  const section = intent.section ?? "workflows";
  const conv = buildConversationContext(priorMessages);
  const similar =
    intent.topic === "similar" ||
    /\b(similar|clone|copy|based on|like this|like that)\b/i.test(userMessage ?? "");

  if (section === "workflows" || /\bworkflow/.test(section)) {
    if (similar && conv.lastEntityName) {
      const prior = await lookupEntity(ctx, conv.lastEntityName, {
        name: conv.lastEntityName,
        priorMessages,
      });
      if (prior?.entity?.type === "workflow") {
        return {
          model: "account-context",
          reply: formatSimilarWorkflowReply({
            name: prior.entity.name,
            description: prior.entity.fields.description
              ? String(prior.entity.fields.description)
              : null,
            steps: prior.entity.fields.steps ? String(prior.entity.fields.steps) : null,
            status: prior.entity.fields.status ? String(prior.entity.fields.status) : null,
          }),
          citations: mergeCitations([
            ...pageCitations,
            ...prior.citations,
            { label: "Workflows", path: "/dashboard/workflows", tool: "build_help" },
          ]),
          toolsUsed: ["build_help", "entity_lookup"],
          sections: ["workflows"],
        };
      }
    }

    const account = await accountLineForSection(ctx, "workflows");
    return {
      model: "account-context",
      reply: formatBuildWorkflowReply(account?.line ?? null),
      citations: mergeCitations([
        ...pageCitations,
        { label: "Workflows", path: "/dashboard/workflows", tool: "build_help" },
        ...(account?.citations ?? []),
      ]),
      toolsUsed: ["build_help", ...(account?.toolsUsed ?? [])],
      sections: ["workflows"],
    };
  }

  const knowledge = getModuleKnowledge(section);
  if (!knowledge) return null;
  return {
    model: "account-context",
    reply: [
      `I can help you set up **${knowledge.name}**.`,
      "",
      knowledge.summary,
      "",
      "Suggested next steps:",
      ...knowledge.capabilities.slice(0, 4).map((c, i) => `${i + 1}. ${c}`),
      "",
      `Open **${knowledge.path}** to start, then tell me what you want to achieve.`,
    ].join("\n"),
    citations: mergeCitations([
      ...pageCitations,
      { label: knowledge.name, path: knowledge.path, tool: "build_help" },
    ]),
    toolsUsed: ["build_help"],
    sections: [section],
  };
}

async function answerDiagnosticOrOptimize(
  ctx: OrgContext,
  userMessage: string,
  priorMessages: ChatMessage[] | undefined,
  pageCitations: AvaCitation[],
  kind: "diagnostic" | "optimize",
): Promise<AccountAnswer | null> {
  const focus =
    kind === "optimize" ? ("optimize" as const) : detectDiagnosticFocus(userMessage);
  const conv = buildConversationContext(priorMessages);

  const entityAnswer = await lookupEntity(ctx, userMessage, {
    priorMessages,
    name:
      // Prefer explicit name in question; else last discussed entity for "this queue" / "it"
      undefined,
  });

  let entity = entityAnswer?.entity ?? null;

  if (!entity && conv.lastEntityName) {
    const prior = await lookupEntity(ctx, conv.lastEntityName, {
      name: conv.lastEntityName,
      priorMessages,
    });
    entity = prior?.entity ?? null;
  }

  // "this queue" with no prior name → try Dental Support-style from question pronouns + section
  if (!entity && /\b(this|that|the)\s+queue\b/i.test(userMessage) && conv.lastEntityName) {
    const prior = await lookupEntity(ctx, conv.lastEntityName, {
      name: conv.lastEntityName,
    });
    entity = prior?.entity ?? null;
  }

  if (!entity) {
    // Fall back: if talking about queues, load Dental Support only when mentioned or sole focus
    if (/\bdental support\b/i.test(userMessage)) {
      const dental = await lookupEntity(ctx, "Dental Support", { name: "Dental Support" });
      entity = dental?.entity ?? null;
    }
  }

  if (!entity) return null;

  const reasoned = reasonAboutEntity(entity, focus);
  if (!reasoned) return null;

  return {
    model: "account-context",
    reply: reasoned,
    citations: mergeCitations([
      ...pageCitations,
      {
        label: entity.label,
        path: entity.path,
        tool: kind === "optimize" ? "metric_optimize" : "metric_diagnostic",
      },
    ]),
    toolsUsed: [kind === "optimize" ? "metric_optimize" : "metric_diagnostic", "entity_lookup"],
    sections: entity.type === "call_queue" ? ["call_queues"] : [],
  };
}

/**
 * Answer account questions from live org data across the whole dashboard.
 * Used before/instead of LLM so Ava always has end-to-end account context.
 */
export async function answerAccountQuestion(
  ctx: OrgContext,
  userMessage: string,
  pathname?: string | null,
  priorMessages?: ChatMessage[],
): Promise<AccountAnswer | null> {
  const q = normalizeQuestion(userMessage);
  const page = resolvePageContext(pathname ?? null);
  const pageCitations = citationsForPathname(pathname);
  const conv = buildConversationContext(priorMessages);
  const intent = classifyAvaIntent(userMessage, conv);

  // Person-specific phone lookups beat inventory sections.
  if (extractContactLookup(userMessage)) {
    const contact = await lookupContact(ctx, userMessage);
    if (contact) {
      return {
        model: "account-context",
        reply: contact.reply,
        citations: mergeCitations([...pageCitations, ...contact.citations]),
        toolsUsed: contact.toolsUsed,
        sections: [],
      };
    }
  }

  // Exact filtered counts/lists beat generic module summaries.
  // e.g. "How many appointments were cancelled?" → **5**, not the full snapshot.
  const plan = buildAvaQueryPlan(intent, userMessage, pathname, conv);
  if (
    (intent.kind === "metric_count" ||
      intent.kind === "filtered_list" ||
      looksLikeFilteredDataQuestion(userMessage, conv) ||
      isExactDataPlan(plan)) &&
    isExactDataPlan(plan)
  ) {
    const exact = await executeAvaQueryPlan(ctx, plan);
    if (exact) {
      return {
        model: "account-context",
        reply: exact.reply,
        citations: mergeCitations([...pageCitations, ...exact.citations]),
        toolsUsed: exact.toolsUsed,
        sections: exact.sections,
      };
    }
  }

  // Feature KPIs (WhatsApp Response Rate, Contact Center top agents, …)
  // beat named-record lookup — "Automation" must not resolve to Zapier.
  if (
    looksLikeModuleMetricQuestion(userMessage, pathname) &&
    intent.kind !== "build_help" &&
    intent.kind !== "concept" &&
    intent.kind !== "metric_count" &&
    intent.kind !== "filtered_list"
  ) {
    const metric = await answerModuleMetric(ctx, userMessage, pathname, pageCitations);
    if (metric) {
      return {
        model: "account-context",
        reply: metric.reply,
        citations: metric.citations,
        toolsUsed: metric.toolsUsed,
        sections: metric.sections,
      };
    }
  }

  // Record / attribute lookup beats generic module summaries — but never
  // steals concept, inventory, navigation, build-help, or filtered data intents.
  const preferRecordLookup =
    intent.kind !== "concept" &&
    intent.kind !== "module_summary" &&
    intent.kind !== "account_summary" &&
    intent.kind !== "metric_count" &&
    intent.kind !== "filtered_list" &&
    intent.kind !== "build_help" &&
    intent.kind !== "navigation" &&
    (intent.kind === "record_attribute" ||
      intent.kind === "entity_lookup" ||
      intent.kind === "diagnostic" ||
      intent.kind === "optimize" ||
      looksLikeRecordOrAttributeQuestion(userMessage, conv));

  if (preferRecordLookup) {
    if (intent.kind === "diagnostic" || intent.kind === "optimize") {
      const diag = await answerDiagnosticOrOptimize(
        ctx,
        userMessage,
        priorMessages,
        pageCitations,
        intent.kind,
      );
      if (diag) return diag;
    }

    const entityAnswer = await lookupEntity(ctx, userMessage, {
      priorMessages,
      pathname,
    });
    if (entityAnswer) {
      if (
        entityAnswer.entity?.type === "call_queue" &&
        !entityAnswer.attribute &&
        /\b(why|improve|service level|agents?)\b/i.test(userMessage)
      ) {
        const focus = detectDiagnosticFocus(userMessage);
        const reasoned = reasonAboutEntity(entityAnswer.entity, focus);
        if (reasoned) {
          return {
            model: "account-context",
            reply: reasoned,
            citations: mergeCitations([...pageCitations, ...entityAnswer.citations]),
            toolsUsed: [...entityAnswer.toolsUsed, "metric_diagnostic"],
            sections: ["call_queues"],
          };
        }
      }

      return {
        model: "account-context",
        reply: entityAnswer.reply,
        citations: mergeCitations([...pageCitations, ...entityAnswer.citations]),
        toolsUsed: entityAnswer.toolsUsed,
        sections: [],
      };
    }
  }

  // Module concept / summary only when this is NOT a specific-record question.
  if (intent.kind === "concept" || intent.kind === "module_summary") {
    const modular = await answerModuleConceptOrSummary(ctx, intent, pageCitations);
    if (modular) return modular;
  }

  if (intent.kind === "build_help") {
    const build = await answerBuildHelp(
      ctx,
      intent,
      pageCitations,
      priorMessages,
      userMessage,
    );
    if (build) return build;
  }

  if (intent.kind === "navigation" && intent.section) {
    const knowledge = getModuleKnowledge(intent.section);
    if (knowledge) {
      return {
        model: "account-context",
        reply: [
          `Open **${knowledge.path}** for **${knowledge.name}**.`,
          "",
          knowledge.summary,
        ].join("\n"),
        citations: mergeCitations([
          ...pageCitations,
          { label: knowledge.name, path: knowledge.path, tool: "navigation" },
        ]),
        toolsUsed: ["navigation"],
        sections: [intent.section],
      };
    }
  }

  // Fallback entity lookup for remaining non-module asks.
  if (
    intent.kind !== "concept" &&
    intent.kind !== "module_summary" &&
    intent.kind !== "account_summary" &&
    intent.kind !== "metric_count" &&
    intent.kind !== "filtered_list" &&
    intent.kind !== "build_help"
  ) {
    const entityAnswer = await lookupEntity(ctx, userMessage, {
      priorMessages,
      pathname,
    });
    if (entityAnswer) {
      return {
        model: "account-context",
        reply: entityAnswer.reply,
        citations: mergeCitations([...pageCitations, ...entityAnswer.citations]),
        toolsUsed: entityAnswer.toolsUsed,
        sections: [],
      };
    }
  }

  let sections = detectAccountSections(userMessage);

  // Follow-up: if user says "tell me about them/it" after a module, keep that section.
  if (
    sections.length === 0 &&
    conv.lastSection &&
    /\b(them|it|this|that|more)\b/.test(q) &&
    !isModuleNamePhrase(userMessage)
  ) {
    sections = [conv.lastSection];
  }

  if (sections.length === 0 && page) {
    const fromPage = pageAreaToSection(page.area);
    if (fromPage && looksLikeAccountQuestion(q)) {
      sections = [fromPage];
    }
  }

  if (
    sections.length === 0 &&
    (/\b(account|everything|all (my )?data|overview|summary)\b/.test(q) ||
      (looksLikeAccountQuestion(q) && /\b(have|got|show me)\b/.test(q)))
  ) {
    const overview = await fetchAccountOverview(ctx);
    return {
      model: "account-context",
      reply: overview.reply,
      citations: mergeCitations([...pageCitations, ...overview.citations]),
      toolsUsed: overview.toolsUsed,
      sections: ["overview"],
    };
  }

  if (sections.length === 0) {
    if (!looksLikeAccountQuestion(q)) return null;
    return {
      model: "account-context",
      reply: formatUnsureSuggestions({ pathname, detectedSections: [] }),
      citations: pageCitations,
      toolsUsed: ["clarify"],
      sections: [],
    };
  }

  // For module summary-ish section hits ("workflows"), prefer concept+data over bare metrics.
  if (
    sections.length === 1 &&
    (intent.kind === "unknown" || intent.kind === "module_summary" || intent.kind === "concept") &&
    /^(tell me|what are|what is|describe|explain)\b/.test(q)
  ) {
    const modular = await answerModuleConceptOrSummary(
      ctx,
      { kind: "module_summary", section: sections[0], topic: sections[0] },
      pageCitations,
    );
    if (modular) return modular;
  }

  const includeEmails = /\bemails?\b/.test(q);
  const results = await Promise.all(
    sections.map((section) =>
      fetchAccountSection(ctx, section, {
        includeEmails: section === "team" ? includeEmails : false,
      }),
    ),
  );

  const citations = mergeCitations([
    ...pageCitations,
    ...results.flatMap((r) => r.citations),
  ]);
  const toolsUsed = results.map((r) => `section:${r.section}`);
  const reply = results.map((r) => formatSectionReply(r)).join("\n\n");

  return {
    model: "account-context",
    reply,
    citations,
    toolsUsed,
    sections,
  };
}

export function listSupportedAccountAreas(): string[] {
  return ACCOUNT_SECTIONS.map((id) => SECTION_META.find((m) => m.id === id)!.label);
}
