/**
 * Cross-tenant webhook org fallback.
 * Only used when ALLOW_WEBHOOK_ORG_FALLBACK=true (single-tenant staging).
 * Production multi-tenant must resolve org from agent/phone/metadata.
 */
export function webhookOrgFallback(): string | null {
  if (process.env.ALLOW_WEBHOOK_ORG_FALLBACK !== "true") {
    return null;
  }
  return process.env.DEFAULT_WEBHOOK_ORG_ID?.trim() || null;
}
