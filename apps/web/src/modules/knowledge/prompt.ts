import type { FaqItem, KnowledgeDocument } from "./types";
import { KNOWLEDGE_SECTION_MARKER } from "@/modules/agents/role-templates";

/** Legacy markers from earlier KB sync — still stripped for clean upgrades. */
export const KNOWLEDGE_FAQS_MARKER = "## Business knowledge (FAQs)";
export const KNOWLEDGE_DOCS_MARKER = "## Reference documents";

const SECTION_MARKERS = [
  KNOWLEDGE_SECTION_MARKER,
  KNOWLEDGE_FAQS_MARKER,
  KNOWLEDGE_DOCS_MARKER,
] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remove any previously injected knowledge section from a system prompt
 * (keeps identity / behavior / guardrails intact).
 */
export function stripKnowledgeAppendix(prompt: string): string {
  const text = prompt ?? "";
  const indexes = SECTION_MARKERS.map((marker) => {
    const withBreak = text.search(new RegExp(`\\n\\n${escapeRegExp(marker)}`));
    if (withBreak >= 0) return withBreak;
    if (text.startsWith(marker)) return 0;
    return -1;
  }).filter((i) => i >= 0);

  if (indexes.length === 0) return text.trim();
  return text.slice(0, Math.min(...indexes)).trim();
}

/**
 * Body content for the Knowledge Base section (without the ## heading).
 */
export function buildKnowledgePromptAppendix(input: {
  faqs: FaqItem[];
  documents?: KnowledgeDocument[];
}): string {
  const parts: string[] = [];

  const faqs = input.faqs.filter((f) => f.status === "published" || f.status === "draft");
  if (faqs.length > 0) {
    parts.push("### FAQs");
    for (const faq of faqs) {
      parts.push(`Q: ${faq.question}\nA: ${faq.answer}`);
    }
  }

  const docs = (input.documents ?? []).filter(
    (d) => d.status === "published" || d.status === "processing",
  );
  if (docs.length > 0) {
    parts.push("### Reference documents");
    for (const doc of docs) {
      const cat = doc.category ? ` (${doc.category})` : "";
      parts.push(`- ${doc.title}${cat}`);
    }
  }

  return parts.join("\n\n");
}

/**
 * Re-attach a fresh ## Knowledge Base section after the role/behavior prompt.
 */
export function composeSystemPromptWithKnowledge(
  userPrompt: string,
  appendix: string,
): string {
  const base = stripKnowledgeAppendix(userPrompt);
  const knowledge = appendix.trim();
  if (!knowledge) {
    return `${base}\n\n${KNOWLEDGE_SECTION_MARKER}\n\nBusiness-specific facts (hours, menu, prices, policies, etc.) are added here automatically from the AgentDesk Knowledge Base after you save FAQs or documents.\n\nUntil facts are added: do not invent hours, prices, addresses, or policies. Ask a clarifying question or offer a callback.`;
  }
  return `${base}\n\n${KNOWLEDGE_SECTION_MARKER}\n\n${knowledge}`;
}
