import type { AgentCapability } from "./types";

export const DEFAULT_CAPABILITY_DEFS = [
  {
    key: "answer_faqs",
    title: "Answer FAQs",
    description: "Answer common questions using the Knowledge Base.",
  },
  {
    key: "take_reservations",
    title: "Take reservations / appointments",
    description: "Collect booking details and create reservation requests.",
  },
  {
    key: "capture_leads",
    title: "Capture leads",
    description: "Collect caller name, phone, and intent for follow-up.",
  },
  {
    key: "offer_callback",
    title: "Offer callback",
    description: "Offer a human callback when the request cannot be completed.",
  },
  {
    key: "transfer_human",
    title: "Transfer to human",
    description: "Offer to connect or escalate to a staff member when needed.",
  },
] as const;

export function defaultCapabilities(enabledKeys?: string[]): AgentCapability[] {
  const enabled = new Set(enabledKeys ?? DEFAULT_CAPABILITY_DEFS.map((c) => c.key));
  return DEFAULT_CAPABILITY_DEFS.map((def) => ({
    key: def.key,
    title: def.title,
    description: def.description,
    enabled: enabled.has(def.key),
  }));
}

/** Short rules injected near the top of the live system prompt. */
export function buildCapabilitiesPromptBlock(capabilities: AgentCapability[]): string {
  const enabled = capabilities.filter((c) => c.enabled);
  const disabled = capabilities.filter((c) => !c.enabled);
  const lines = ["## Enabled capabilities"];
  if (enabled.length === 0) {
    lines.push("- No special capabilities enabled; stick to greetings and callback offers.");
  } else {
    for (const cap of enabled) {
      lines.push(`- ${cap.title}: ${cap.description}`);
    }
  }
  if (disabled.length > 0) {
    lines.push("");
    lines.push("## Disabled capabilities (do not offer)");
    for (const cap of disabled) {
      lines.push(`- ${cap.title}`);
    }
  }
  return lines.join("\n");
}

export function mergeCapabilitiesBlock(systemPrompt: string, capabilities: AgentCapability[]): string {
  const block = buildCapabilitiesPromptBlock(capabilities);
  const marker = "## Enabled capabilities";
  const without = systemPrompt.includes(marker)
    ? systemPrompt.slice(0, systemPrompt.indexOf(marker)).trimEnd()
    : systemPrompt.trimEnd();
  // Insert after Identity section if present, else after first heading block.
  const identityEnd = without.search(/\n## (?!Identity)/);
  if (identityEnd > 0) {
    return `${without.slice(0, identityEnd).trimEnd()}\n\n${block}\n\n${without.slice(identityEnd).trimStart()}`;
  }
  return `${without}\n\n${block}`;
}
