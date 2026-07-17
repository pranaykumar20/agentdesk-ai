import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export const MARKETING_CHAT_SYSTEM_PROMPT = `You are Ava, the AI assistant for AgentDesk AI — an AI Workforce Operating System.

Your job:
- Answer questions about AgentDesk AI (product, pricing, features, industries, demos, security, integrations).
- Help visitors understand how AI employees work (receptionists, sales, support, scheduling, billing, after-hours).
- Answer general business/operations questions helpfully when asked.
- Be concise, friendly, and professional.
- Always format replies in clean Markdown:
  - short paragraphs separated by blank lines
  - **bold** for key product terms
  - bullet lists for features, steps, or options
  - numbered lists for multi-step guidance
  - links as [Start free trial](/signup) or [Book a demo](/audit) when relevant
- Do not wrap the whole reply in a code fence.
- When relevant, suggest starting a free trial (/signup) or booking a demo (/audit).
- Never invent fake customer counts, testimonials, certifications, or guaranteed ROI numbers.
- If you are unsure about a private account detail, say so and offer a demo/trial path.
- Do not request or store passwords, API keys, or payment card numbers.
- IMPORTANT: This is a customer-support chat only. Do NOT edit files, run shell commands, or modify the codebase. Reply with Markdown text only.

Product facts you can use:
- AgentDesk AI lets businesses create AI employees for phone, SMS, WhatsApp, chat, and CRM workflows.
- Core outcomes: answer calls, qualify leads, book appointments, route callers, resolve support questions, send follow-ups, update CRM, run after hours.
- Integrations include Google Calendar, HubSpot, Salesforce, Twilio, Slack, Stripe, QuickBooks, Zapier, Microsoft 365, and webhooks.
- Plans typically include Starter, Professional, and Business with free trial available.
- Human handoff, escalation rules, and analytics/ROI tracking are first-class features.`;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

export function sanitizeChatMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  const cleaned: ChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!trimmed) continue;
    cleaned.push({ role, content: trimmed });
  }

  return cleaned.slice(-MAX_MESSAGES);
}

function buildPrompt(messages: ChatMessage[]): string {
  const history = messages
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "Visitor" : "Ava"}: ${m.content}`)
    .join("\n");
  const latest = messages[messages.length - 1]?.content ?? "";

  return [
    MARKETING_CHAT_SYSTEM_PROMPT,
    "",
    history ? `Previous conversation:\n${history}\n` : "",
    `Latest visitor message:\n${latest}`,
    "",
    "Respond as Ava with a helpful final answer only, using clean Markdown formatting.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function ensureChatWorkspace(): Promise<string> {
  const workspace = path.join(os.tmpdir(), "agentdesk-marketing-chat");
  await mkdir(workspace, { recursive: true });
  if (process.env.VERCEL) {
    process.env.HOME = "/tmp";
  }
  return workspace;
}

async function generateWithCursor(messages: ChatMessage[]): Promise<{ reply: string; model: string }> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing CURSOR_API_KEY");
  }

  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";
  const workspace = await ensureChatWorkspace();
  // Dynamic import keeps @cursor/sdk out of the webpack graph for pages.
  const { Agent, AuthenticationError, CursorAgentError } = await import("@cursor/sdk");

  try {
    const result = await Agent.prompt(buildPrompt(messages), {
      apiKey,
      model: { id: modelId },
      name: "agentdesk-marketing-ava",
      local: {
        cwd: workspace,
        settingSources: [],
      },
    });

    if (result.status === "error") {
      throw new Error(`Cursor agent run failed: ${result.id}`);
    }

    const reply =
      result.result?.trim() ||
      "Sorry — I couldn't generate a response just now. Please try again, or book a demo at /audit.";

    return { reply, model: modelId };
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

/** OpenAI-compatible fallback if Cursor key is unavailable. */
async function generateWithOpenAI(messages: ChatMessage[]): Promise<{ reply: string; model: string }> {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    "";
  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() ||
    (process.env.AI_GATEWAY_API_KEY ? "https://ai-gateway.vercel.sh/v1" : "https://api.openai.com/v1");
  const model = process.env.LLM_MODEL?.trim() || "gpt-4o-mini";

  if (!apiKey) {
    return {
      model: "fallback",
      reply:
        "I'd love to help — configure `CURSOR_API_KEY` (recommended) or `OPENAI_API_KEY` for live AI replies. Meanwhile: AgentDesk AI builds AI employees for calls, SMS, WhatsApp, chat, and CRM. Start a free trial at /signup or book a demo at /audit.",
    };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: 700,
      messages: [
        { role: "system", content: MARKETING_CHAT_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Chat LLM failed: ${response.status} ${text.slice(0, 300)}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply =
    json.choices?.[0]?.message?.content?.trim() ||
    "Sorry — I couldn't generate a response just now. Please try again, or book a demo at /audit.";

  return { reply, model };
}

export async function generateMarketingChatReply(
  messages: ChatMessage[],
): Promise<{ reply: string; model: string }> {
  if (process.env.CURSOR_API_KEY?.trim()) {
    return generateWithCursor(messages);
  }
  return generateWithOpenAI(messages);
}
