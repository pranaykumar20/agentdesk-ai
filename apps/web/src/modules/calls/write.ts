import { createAdminClient } from "@/lib/supabase/server";
import { getServiceRoleKey, getSupabaseEnv } from "@/lib/supabase/env";
import type { CallStatus } from "./types";

type RetellCall = {
  call_id?: string;
  agent_id?: string;
  from_number?: string;
  to_number?: string;
  direction?: string;
  call_status?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  disconnection_reason?: string;
  transcript?: string;
  transcript_object?: Array<{ role?: string; content?: string; words?: unknown[] }>;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    custom_analysis_data?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
};

function mapRetellStatus(status?: string): CallStatus {
  switch ((status ?? "").toLowerCase()) {
    case "registered":
    case "ongoing":
      return "in_progress";
    case "ended":
    case "analyzed":
      return "completed";
    case "error":
      return "failed";
    case "not_connected":
      return "no_answer";
    default:
      return "completed";
  }
}

/** Resolve tenant for Retell call sync. Prefer call metadata; optional env fallback. */
export function resolveOrganizationId(call: RetellCall): string | null {
  const meta = call.metadata ?? {};
  const fromMeta =
    (typeof meta.organization_id === "string" && meta.organization_id) ||
    (typeof meta.organizationId === "string" && meta.organizationId) ||
    null;
  return fromMeta || process.env.DEFAULT_WEBHOOK_ORG_ID?.trim() || null;
}

/**
 * Upsert a call row (and optional summary/transcript) from a Retell webhook payload.
 * Requires SUPABASE_SERVICE_ROLE_KEY. No-ops if not configured.
 */
export async function upsertCallFromRetellEvent(raw: unknown): Promise<{ callId: string | null }> {
  if (!getSupabaseEnv().configured || !getServiceRoleKey()) {
    return { callId: null };
  }

  const body = raw as { event?: string; call?: RetellCall };
  const call = body.call;
  if (!call?.call_id) return { callId: null };

  const organizationId = resolveOrganizationId(call);
  if (!organizationId) {
    console.warn("[calls:write] missing organization_id on Retell call metadata", call.call_id);
    return { callId: null };
  }

  const admin = createAdminClient();
  const startedAt = call.start_timestamp
    ? new Date(call.start_timestamp).toISOString()
    : new Date().toISOString();
  const endedAt = call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null;
  const durationSeconds =
    call.start_timestamp && call.end_timestamp
      ? Math.max(0, Math.round((call.end_timestamp - call.start_timestamp) / 1000))
      : null;

  const row = {
    organization_id: organizationId,
    direction: call.direction === "outbound" ? "outbound" : "inbound",
    status: mapRetellStatus(call.call_status),
    disposition: call.disconnection_reason ?? null,
    from_number: call.from_number ?? null,
    to_number: call.to_number ?? null,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    external_call_id: call.call_id,
    external_provider: "retell",
    sentiment: call.call_analysis?.user_sentiment ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from("calls")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("external_call_id", call.call_id)
    .maybeSingle();

  let callId = existing?.id ?? null;

  if (existing) {
    await admin.from("calls").update(row).eq("id", existing.id);
  } else {
    const { data: inserted, error } = await admin.from("calls").insert(row).select("id").single();
    if (error) {
      console.error("[calls:write] insert failed", error.message);
      return { callId: null };
    }
    callId = inserted.id;
  }

  if (!callId) return { callId: null };

  await admin.from("call_events").insert({
    organization_id: organizationId,
    call_id: callId,
    event_type: body.event ?? "retell_event",
    payload: (raw ?? {}) as Record<string, unknown>,
  });

  const summary = call.call_analysis?.call_summary;
  if (summary) {
    await admin.from("call_summaries").upsert(
      {
        organization_id: organizationId,
        call_id: callId,
        summary,
        key_topics: [],
        insights: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "call_id" },
    );
  }

  const turns = call.transcript_object ?? [];
  if (turns.length > 0) {
    await admin.from("call_transcripts").delete().eq("call_id", callId);
    const rows = turns.map((t, index) => ({
      organization_id: organizationId,
      call_id: callId!,
      speaker: t.role === "agent" ? "ai" : t.role === "user" ? "caller" : "system",
      content: t.content ?? "",
      sort_order: index,
    }));
    if (rows.length) {
      await admin.from("call_transcripts").insert(rows);
    }
  }

  return { callId };
}
