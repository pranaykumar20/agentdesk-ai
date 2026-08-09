import { mergeCapabilitiesBlock } from "./capabilities";
import {
  buildRoleSystemPrompt,
  defaultGreetingForRole,
} from "./role-templates";
import type { AgentCapability } from "./types";

async function completePromptText(system: string, user: string): Promise<string> {
  const cursorKey = process.env.CURSOR_API_KEY?.trim();
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (cursorKey) {
    const { mkdir } = await import("node:fs/promises");
    const os = await import("node:os");
    const path = await import("node:path");
    const workspace = path.join(os.tmpdir(), "agentdesk-prompt-generate");
    await mkdir(workspace, { recursive: true });
    if (process.env.VERCEL) process.env.HOME = "/tmp";
    const { Agent } = await import("@cursor/sdk");
    const result = await Agent.prompt(`${system}\n\n${user}\n\nReturn ONLY JSON.`, {
      apiKey: cursorKey,
      model: { id: process.env.CURSOR_MODEL?.trim() || "composer-2.5" },
      name: "agentdesk-prompt-generate",
      local: { cwd: workspace, settingSources: [] },
    });
    if (result.status === "error") throw new Error("Cursor prompt generation failed");
    return result.result?.trim() || "{}";
  }

  const apiKey = gatewayKey || openaiKey;
  if (!apiKey) {
    throw new Error(
      "No AI provider configured. Set CURSOR_API_KEY, AI_GATEWAY_API_KEY, or OPENAI_API_KEY.",
    );
  }
  const baseUrl = gatewayKey
    ? "https://ai-gateway.vercel.sh/v1"
    : (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Prompt generation failed (${response.status}): ${text.slice(0, 240)}`);
  }
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || "{}";
}

function extractJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("AI returned non-JSON prompt content");
  }
}

export async function generateEmployeePrompt(input: {
  agentName: string;
  businessName: string;
  roleTitle: string;
  industry?: string;
  tone?: string;
  language?: string;
  brief?: string;
  capabilities?: AgentCapability[];
}): Promise<{ systemPrompt: string; greeting: string }> {
  const roleCtx = {
    agentName: input.agentName,
    businessName: input.businessName,
    roleTitle: input.roleTitle,
    tone: input.tone,
    industry: input.industry,
    language: input.language,
  };
  const seed = buildRoleSystemPrompt(roleCtx);
  const greetingSeed = defaultGreetingForRole(roleCtx);
  const caps = input.capabilities ?? [];

  if (!input.brief?.trim()) {
    return {
      systemPrompt: caps.length ? mergeCapabilitiesBlock(seed, caps) : seed,
      greeting: greetingSeed,
    };
  }

  const system = `You customize voice-agent system prompts for AgentDesk.
Return ONLY JSON: {"systemPrompt":"...","greeting":"..."}.
Keep markdown sections including "## Knowledge Base".
Respect guardrails: no invented prices/hours; no unsafe card collection.
If language is te-IN, include a Spoken language (Telugu) section and Telugu-friendly greeting.`;

  const user = [
    `Business: ${input.businessName}`,
    `Agent: ${input.agentName}`,
    `Role: ${input.roleTitle}`,
    `Industry: ${input.industry ?? "general"}`,
    `Tone: ${input.tone ?? "Friendly professional"}`,
    `Language: ${input.language ?? "en-US"}`,
    "",
    "Seed template:",
    seed.slice(0, 6000),
    "",
    "Business brief to weave into the prompt:",
    input.brief.trim(),
  ].join("\n");

  try {
    const raw = await completePromptText(system, user);
    const parsed = extractJson(raw);
    const systemPrompt = String(parsed.systemPrompt ?? "").trim() || seed;
    const greeting = String(parsed.greeting ?? "").trim() || greetingSeed;
    return {
      systemPrompt: caps.length ? mergeCapabilitiesBlock(systemPrompt, caps) : systemPrompt,
      greeting,
    };
  } catch {
    return {
      systemPrompt: caps.length ? mergeCapabilitiesBlock(seed, caps) : seed,
      greeting: greetingSeed,
    };
  }
}
