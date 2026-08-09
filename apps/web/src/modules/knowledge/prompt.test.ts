import { describe, expect, it } from "vitest";
import { KNOWLEDGE_SECTION_MARKER } from "@/modules/agents/role-templates";
import {
  buildKnowledgePromptAppendix,
  composeSystemPromptWithKnowledge,
  stripKnowledgeAppendix,
} from "./prompt";
import type { FaqItem, KnowledgeDocument } from "./types";

describe("knowledge prompt section", () => {
  it("formats FAQs and document titles as Knowledge Base body", () => {
    const faqs: FaqItem[] = [
      {
        id: "1",
        organizationId: "org",
        question: "Hours?",
        answer: "9–5",
        category: "General",
        status: "published",
        agentId: null,
      },
    ];
    const documents: KnowledgeDocument[] = [
      {
        id: "d1",
        organizationId: "org",
        title: "Menu",
        status: "published",
        category: "Food",
        mimeType: "text/plain",
        byteSize: 10,
        viewCount: 0,
        helpfulRate: null,
        updatedAt: new Date().toISOString(),
        agentId: null,
      },
    ];
    const appendix = buildKnowledgePromptAppendix({ faqs, documents });
    expect(appendix).toContain("### FAQs");
    expect(appendix).toContain("Q: Hours?");
    expect(appendix).toContain("- Menu (Food)");
  });

  it("replaces ## Knowledge Base without duplicating role instructions", () => {
    const base = `You are Ava.\n\n## Guardrails\n- Be kind\n\n${KNOWLEDGE_SECTION_MARKER}\n\nold facts`;
    const composed = composeSystemPromptWithKnowledge(base, "Q: New\nA: Yes");
    expect(composed).toContain("## Guardrails");
    expect(composed).toContain(KNOWLEDGE_SECTION_MARKER);
    expect(composed).toContain("Q: New");
    expect(composed).not.toContain("old facts");
    expect(composed.match(new RegExp(KNOWLEDGE_SECTION_MARKER, "g"))?.length).toBe(1);
    expect(stripKnowledgeAppendix(composed)).toContain("## Guardrails");
    expect(stripKnowledgeAppendix(composed)).not.toContain(KNOWLEDGE_SECTION_MARKER);
  });
});
