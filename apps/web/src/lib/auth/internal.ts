/** @deprecated Use Retell webhooks — kept for legacy Twilio routes */
export function getVoiceWorkerWsUrl(): string {
  const url = process.env.VOICE_WORKER_URL ?? "ws://localhost:3001";
  return `${url.replace(/\/$/, "")}/twilio/stream`;
}

export function getWebhookBaseUrl(): string {
  return (
    process.env.TWILIO_WEBHOOK_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

const DEV_PLACEHOLDER_SECRET = "change-me-in-production";

/**
 * Authenticate legacy `/api/internal/*` routes.
 * Rejects missing/placeholder secrets in production.
 */
export function verifyInternalAuth(request: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret || secret === DEV_PLACEHOLDER_SECRET) {
    if (process.env.NODE_ENV === "production") return false;
  }
  const effective = secret || DEV_PLACEHOLDER_SECRET;
  const header = request.headers.get("authorization");
  return header === `Bearer ${effective}`;
}
