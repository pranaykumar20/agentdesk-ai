import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type GeneratedFaqDraft = {
  question: string;
  answer: string;
  category: string;
};

export type GeneratedArticleDraft = {
  title: string;
  category: string;
  summary: string;
};

export type KnowledgeGenerateResult = {
  faqs: GeneratedFaqDraft[];
  article: GeneratedArticleDraft | null;
  model: string;
};

type LlmProvider = {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  kind: "openai-compatible" | "cursor";
};

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI returned non-JSON content");
  }
}

function normalizeFaqs(raw: unknown, max: number): GeneratedFaqDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = String(row.question ?? "").trim();
      const answer = String(row.answer ?? "").trim();
      const category = String(row.category ?? "General").trim() || "General";
      if (!question || !answer) return null;
      return {
        question: question.slice(0, 500),
        answer: answer.slice(0, 4000),
        category: category.slice(0, 80),
      };
    })
    .filter((f): f is GeneratedFaqDraft => Boolean(f))
    .slice(0, max);
}

function listProviders(): LlmProvider[] {
  const providers: LlmProvider[] = [];
  const cursorKey = process.env.CURSOR_API_KEY?.trim();
  if (cursorKey) {
    providers.push({
      name: "cursor",
      apiKey: cursorKey,
      model: process.env.CURSOR_MODEL?.trim() || "composer-2.5",
      kind: "cursor",
    });
  }

  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) {
    providers.push({
      name: "ai-gateway",
      apiKey: gatewayKey,
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      model: process.env.LLM_MODEL?.trim() || "gpt-4o-mini",
      kind: "openai-compatible",
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    providers.push({
      name: "openai",
      apiKey: openaiKey,
      baseUrl: (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
        /\/$/,
        "",
      ),
      model: process.env.LLM_MODEL?.trim() || "gpt-4o-mini",
      kind: "openai-compatible",
    });
  }

  return providers;
}

function friendlyProviderError(status: number, body: string): string {
  if (
    status === 429 ||
    /insufficient_quota|no credits remaining|billing/i.test(body)
  ) {
    return (
      "AI credits are exhausted on the current provider. " +
      "Add OpenAI credits at https://platform.openai.com/settings/organization/billing, " +
      "or set AI_GATEWAY_API_KEY / ensure CURSOR_API_KEY is available, then retry."
    );
  }
  return `AI generation failed (${status}): ${body.slice(0, 240)}`;
}

async function completeWithOpenAiCompatible(
  provider: LlmProvider,
  system: string,
  user: string,
): Promise<string> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.4,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(friendlyProviderError(response.status, text));
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || "{}";
}

async function completeWithCursor(
  provider: LlmProvider,
  system: string,
  user: string,
): Promise<string> {
  const workspace = path.join(os.tmpdir(), "agentdesk-knowledge-generate");
  await mkdir(workspace, { recursive: true });
  if (process.env.VERCEL) {
    process.env.HOME = "/tmp";
  }

  const { Agent, AuthenticationError, CursorAgentError } = await import("@cursor/sdk");
  const prompt = [
    system,
    "",
    user,
    "",
    "Respond with ONLY the JSON object. No markdown fences, no commentary.",
  ].join("\n");

  try {
    const result = await Agent.prompt(prompt, {
      apiKey: provider.apiKey,
      model: { id: provider.model },
      name: "agentdesk-knowledge-generate",
      local: {
        cwd: workspace,
        settingSources: [],
      },
    });

    if (result.status === "error") {
      throw new Error(`Cursor agent run failed: ${result.id}`);
    }

    return result.result?.trim() || "{}";
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw new Error(
        "Invalid or expired CURSOR_API_KEY. Create a new key at https://cursor.com/dashboard/integrations.",
      );
    }
    if (error instanceof CursorAgentError) {
      throw new Error(error.message || "Cursor agent failed to start.");
    }
    throw error;
  }
}

async function completeJson(system: string, user: string): Promise<{ content: string; model: string }> {
  const providers = listProviders();
  if (providers.length === 0) {
    throw new Error(
      "No AI provider configured. Set CURSOR_API_KEY (recommended), AI_GATEWAY_API_KEY, or OPENAI_API_KEY.",
    );
  }

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const content =
        provider.kind === "cursor"
          ? await completeWithCursor(provider, system, user)
          : await completeWithOpenAiCompatible(provider, system, user);
      return { content, model: `${provider.name}:${provider.model}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${message}`);
      // Try next provider on quota / auth / transport failures.
      continue;
    }
  }

  throw new Error(errors[errors.length - 1] || "AI generation failed on all providers.");
}

/**
 * Turn a short business brief into FAQ drafts (+ optional article summary)
 * for the Knowledge Base UI. Does not persist — caller reviews then saves.
 */
export async function generateKnowledgeDrafts(input: {
  requirements: string;
  businessName?: string;
  industry?: string;
  agentName?: string;
  language?: string;
  faqCount?: number;
  includeArticle?: boolean;
}): Promise<KnowledgeGenerateResult> {
  const requirements = input.requirements.trim();
  if (requirements.length < 20) {
    throw new Error("Describe your business or knowledge needs in at least a short paragraph.");
  }

  const faqCount = Math.min(8, Math.max(1, input.faqCount ?? 5));
  const language = input.language?.trim() || "en-US";
  const isTelugu = language.toLowerCase().startsWith("te");
  const languageRule = isTelugu
    ? "Spoken language is Telugu (te-IN): write FAQ questions and answers primarily in Telugu script suitable for TTS, with short English glosses in parentheses for staff editing when helpful."
    : `Write all FAQ questions and answers in the caller's language locale: ${language}.`;

  const system = `You help restaurant and local-business owners build a phone receptionist knowledge base.
Return ONLY valid JSON with this shape:
{
  "faqs": [{"question":"...","answer":"...","category":"..."}],
  "article": {"title":"...","category":"...","summary":"..."} | null
}
Rules:
- Write clear, caller-friendly FAQs a voice agent can speak aloud.
- ${languageRule}
- Prefer concrete facts from the user requirements; do not invent phone numbers, prices, or addresses that were not provided.
- If a detail is missing, write a short answer that asks the staff to confirm, or omit that FAQ.
- Categories like Hours, Menu, Reservations, Parking, Policies, General (category labels may stay English).
- Keep answers concise (2-5 sentences).
- Produce exactly ${faqCount} FAQs when enough material exists; fewer is OK if requirements are thin.
- ${input.includeArticle === false ? "Set article to null." : "Include one article summary suitable as a knowledge article title + short summary (same language rules as FAQs)."}`;

  const user = [
    input.businessName ? `Business: ${input.businessName}` : null,
    input.industry ? `Industry: ${input.industry}` : null,
    input.agentName ? `AI employee: ${input.agentName}` : null,
    `Language: ${language}`,
    "",
    "Requirements / facts to encode:",
    requirements,
  ]
    .filter(Boolean)
    .join("\n");

  const { content, model } = await completeJson(system, user);
  const parsed = extractJsonObject(content) as {
    faqs?: unknown;
    article?: unknown;
  };

  const faqs = normalizeFaqs(parsed.faqs, faqCount);
  let article: GeneratedArticleDraft | null = null;
  if (input.includeArticle !== false && parsed.article && typeof parsed.article === "object") {
    const a = parsed.article as Record<string, unknown>;
    const title = String(a.title ?? "").trim();
    const summary = String(a.summary ?? "").trim();
    const category = String(a.category ?? "General").trim() || "General";
    if (title && summary) {
      article = {
        title: title.slice(0, 200),
        category: category.slice(0, 80),
        summary: summary.slice(0, 2000),
      };
    }
  }

  if (faqs.length === 0 && !article) {
    throw new Error("AI could not draft knowledge from that description. Add more details and try again.");
  }

  return { faqs, article, model };
}

/** Fill one FAQ answer (and polish the question) from a short note. */
export async function generateSingleFaqDraft(input: {
  brief: string;
  question?: string;
  businessName?: string;
  language?: string;
}): Promise<GeneratedFaqDraft> {
  const brief = input.brief.trim() || input.question?.trim() || "";
  if (brief.length < 8) {
    throw new Error("Enter a question or a short note for AI to expand.");
  }

  const result = await generateKnowledgeDrafts({
    requirements: [
      input.question ? `Seed question: ${input.question}` : null,
      `Draft one strong FAQ from this note: ${brief}`,
      input.businessName ? `Business: ${input.businessName}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    businessName: input.businessName,
    language: input.language,
    faqCount: 1,
    includeArticle: false,
  });

  const faq = result.faqs[0];
  if (!faq) throw new Error("AI did not return an FAQ draft.");
  return faq;
}
