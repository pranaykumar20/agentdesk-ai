import { createAdminClient } from "@/lib/supabase/server";
import { getServiceRoleKey, getSupabaseEnv } from "@/lib/supabase/env";

const memoryKeys = new Set<string>();

export type WebhookClaimResult =
  | { claimed: true; eventId: string }
  | { claimed: false; reason: "duplicate" | "unavailable" };

function memoryKey(provider: string, idempotencyKey: string) {
  return `${provider}:${idempotencyKey}`;
}

/**
 * Claim a webhook for processing. Uses webhook_events unique (provider, idempotency_key).
 * Falls back to in-memory set when Supabase service role is not configured.
 */
export async function claimWebhookEvent(input: {
  provider: string;
  idempotencyKey: string;
  eventType?: string;
  payload: unknown;
}): Promise<WebhookClaimResult> {
  const key = memoryKey(input.provider, input.idempotencyKey);

  if (!getSupabaseEnv().configured || !getServiceRoleKey()) {
    if (memoryKeys.has(key)) return { claimed: false, reason: "duplicate" };
    memoryKeys.add(key);
    return { claimed: true, eventId: `mem_${crypto.randomUUID().slice(0, 8)}` };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("webhook_events")
      .insert({
        provider: input.provider,
        idempotency_key: input.idempotencyKey,
        event_type: input.eventType ?? null,
        payload: (input.payload ?? {}) as Record<string, unknown>,
        status: "processing",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { claimed: false, reason: "duplicate" };
      console.error("[webhook] claim insert failed", error.message);
      // Fail closed when service role is configured — avoid duplicate side effects.
      return { claimed: false, reason: "unavailable" };
    }

    return { claimed: true, eventId: data.id };
  } catch (err) {
    console.error("[webhook] claim unavailable", err);
    return { claimed: false, reason: "unavailable" };
  }
}

export async function completeWebhookEvent(
  eventId: string,
  result: { status: "processed" | "error"; errorMessage?: string },
): Promise<void> {
  if (eventId.startsWith("mem_")) return;
  if (!getSupabaseEnv().configured || !getServiceRoleKey()) return;

  try {
    const admin = createAdminClient();
    await admin
      .from("webhook_events")
      .update({
        status: result.status,
        error_message: result.errorMessage ?? null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventId);
  } catch (err) {
    console.error("[webhook] complete failed", err);
  }
}
