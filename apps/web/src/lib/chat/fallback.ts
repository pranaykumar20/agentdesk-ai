import type { OrgContext } from "@/lib/auth";
import type { ChatMessage } from "@/lib/marketing/chat-agent";
import { answerAccountQuestion, type AccountAnswer } from "./account-answer";
import { fetchAccountOverview } from "./account-sections";
import type { AvaCitation } from "./citations";
import { citationsForPathname, mergeCitations } from "./citations";
import { formatUnsureSuggestions } from "./module-metrics";
import { resolvePageContext } from "./page-context";
import { detectAccountSections } from "./account-answer";

export type FallbackAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  model: "fallback-template" | "account-context";
};

/**
 * Answer account questions from live org data across the whole app.
 * Prefer this over LLM for metrics / lists / counts.
 */
export async function tryTemplateFallback(
  ctx: OrgContext,
  userMessage: string,
  pathname?: string | null,
  priorMessages?: ChatMessage[],
): Promise<FallbackAnswer | null> {
  const answer: AccountAnswer | null = await answerAccountQuestion(
    ctx,
    userMessage,
    pathname,
    priorMessages,
  );
  if (!answer) return null;
  return {
    model: answer.model,
    reply: answer.reply,
    citations: answer.citations,
    toolsUsed: answer.toolsUsed,
  };
}

/**
 * When nothing else matched, offer concrete next checks (page + common metrics)
 * instead of a dead-end or a huge undifferentiated dump.
 */
export async function softUnavailableReply(
  ctx: OrgContext,
  pathname?: string | null,
  lastUserMessage?: string | null,
): Promise<FallbackAnswer> {
  const pageCitations = citationsForPathname(pathname);
  const page = resolvePageContext(pathname ?? null);
  const detected = lastUserMessage ? detectAccountSections(lastUserMessage) : [];

  try {
    const overview = await fetchAccountOverview(ctx);
    return {
      model: "account-context",
      toolsUsed: [...overview.toolsUsed, "clarify"],
      citations: mergeCitations([...pageCitations, ...overview.citations]),
      reply: [
        formatUnsureSuggestions({
          pathname,
          detectedSections: detected,
          foundLabels: page
            ? [`You’re on **${page.area.replace(/-/g, " ")}** — I can read metrics from this page`]
            : undefined,
        }),
        "",
        "Or ask for a full account snapshot if you want the broad overview.",
      ].join("\n"),
    };
  } catch {
    return {
      model: "fallback-template",
      toolsUsed: ["clarify"],
      citations: pageCitations,
      reply: formatUnsureSuggestions({ pathname, detectedSections: detected }),
    };
  }
}
