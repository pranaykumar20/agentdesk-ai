const SECRET_PATTERNS: RegExp[] = [
  /\bsk[_-](?:live|test)[_-][A-Za-z0-9]{10,}\b/i,
  /\b(?:rk_live|rk_test|whsec_)[A-Za-z0-9_-]{8,}\b/i,
  /\bcus_[A-Za-z0-9]{8,}\b/,
  /\bsub_[A-Za-z0-9]{8,}\b/,
  /\bAC[a-f0-9]{32}\b/i,
  /\bBearer\s+[A-Za-z0-9._\-]{20,}\b/i,
  /\bCURSOR_API_KEY\b/i,
  /\bSUPABASE_SERVICE_ROLE\b/i,
];

const MUTATION_CLAIM_PATTERNS: RegExp[] = [
  /\bI(?:'ve| have) (?:just )?(?:updated|changed|deleted|removed|invited|paused|published|charged|canceled|cancelled)\b/i,
  /\b(?:successfully )?(?:invited|deleted|removed|paused|published|updated) (?:your|the)\b/i,
  /\bI (?:went ahead and|already) (?:updated|changed|invited|deleted)\b/i,
];

export type GuardResult = {
  ok: boolean;
  reply: string;
  reasons: string[];
};

export function guardAssistantReply(reply: string): GuardResult {
  const reasons: string[] = [];
  let next = reply;

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(next)) {
      reasons.push("secret_pattern");
      next = next.replace(pattern, "[redacted]");
    }
  }

  for (const pattern of MUTATION_CLAIM_PATTERNS) {
    if (pattern.test(next)) {
      reasons.push("mutation_claim");
      break;
    }
  }

  if (reasons.includes("mutation_claim")) {
    return {
      ok: false,
      reasons,
      reply:
        "I can help with that, but I won’t claim a change was made until you confirm an action in chat. Ask me to propose the change, then approve it.",
    };
  }

  if (reasons.includes("secret_pattern")) {
    return {
      ok: true,
      reasons,
      reply:
        next.trim() ||
        "I found sensitive-looking credentials in a draft reply and removed them. Please check the relevant settings page in the dashboard instead of sharing secrets in chat.",
    };
  }

  return { ok: true, reply: next, reasons };
}
