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

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  return false;
}

async function resolveOrgFromAgentOrNumber(
  admin: ReturnType<typeof createAdminClient>,
  call: RetellCall,
): Promise<{ organizationId: string; agentId: string | null; phoneNumberId: string | null } | null> {
  if (call.agent_id) {
    const { data: agent } = await admin
      .from("ai_agents")
      .select("id, organization_id")
      .eq("external_agent_id", call.agent_id)
      .maybeSingle();
    if (agent) {
      let phoneNumberId: string | null = null;
      if (call.to_number) {
        const { data: phone } = await admin
          .from("phone_numbers")
          .select("id")
          .eq("organization_id", agent.organization_id)
          .eq("e164", call.to_number)
          .maybeSingle();
        phoneNumberId = phone?.id ?? null;
      }
      return {
        organizationId: agent.organization_id,
        agentId: agent.id,
        phoneNumberId,
      };
    }
  }

  const lookupNumber =
    call.direction === "outbound" ? call.from_number : call.to_number ?? call.from_number;
  if (lookupNumber) {
    const { data: phone } = await admin
      .from("phone_numbers")
      .select("id, organization_id")
      .eq("e164", lookupNumber)
      .maybeSingle();
    if (phone) {
      const { data: assignment } = await admin
        .from("phone_number_assignments")
        .select("agent_id")
        .eq("phone_number_id", phone.id)
        .maybeSingle();
      return {
        organizationId: phone.organization_id,
        agentId: assignment?.agent_id ?? null,
        phoneNumberId: phone.id,
      };
    }
  }

  return null;
}

/** Resolve tenant for Retell call sync. Prefer call metadata; then agent/number lookup. */
export async function resolveOrganizationId(call: RetellCall): Promise<string | null> {
  const meta = call.metadata ?? {};
  const fromMeta =
    (typeof meta.organization_id === "string" && meta.organization_id) ||
    (typeof meta.organizationId === "string" && meta.organizationId) ||
    null;
  if (fromMeta) return fromMeta;

  if (!getSupabaseEnv().configured || !getServiceRoleKey()) {
    return process.env.DEFAULT_WEBHOOK_ORG_ID?.trim() || null;
  }

  try {
    const admin = createAdminClient();
    const resolved = await resolveOrgFromAgentOrNumber(admin, call);
    if (resolved) return resolved.organizationId;
  } catch (err) {
    console.warn("[calls:write] org resolution failed", err);
  }

  return process.env.DEFAULT_WEBHOOK_ORG_ID?.trim() || null;
}

async function upsertContactAndLead(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    organizationId: string;
    callId: string;
    fromNumber: string | null;
    summary: string | null;
    analysis: Record<string, unknown>;
  },
): Promise<{ contactId: string | null; leadId: string | null }> {
  const callerName = asString(input.analysis.caller_name);
  const intent = asString(input.analysis.intent)?.toLowerCase() ?? null;
  const notes =
    asString(input.analysis.notes) ||
    input.summary ||
    (intent ? `Voice intent: ${intent}` : "Inbound voice lead");
  const callbackRequested = asBoolean(input.analysis.callback_requested);

  let contactId: string | null = null;
  if (input.fromNumber) {
    const { data: existingContact } = await admin
      .from("contacts")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("phone", input.fromNumber)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
      if (callerName) {
        await admin
          .from("contacts")
          .update({ full_name: callerName, updated_at: new Date().toISOString() })
          .eq("id", contactId);
      }
    } else {
      const { data: created } = await admin
        .from("contacts")
        .insert({
          organization_id: input.organizationId,
          full_name: callerName,
          phone: input.fromNumber,
        })
        .select("id")
        .single();
      contactId = created?.id ?? null;
    }
  }

  let status = "new";
  if (intent?.includes("appointment") || intent?.includes("reservation")) status = "qualified";
  if (callbackRequested) status = "callback";

  let leadId: string | null = null;
  if (contactId) {
    const { data: existingLead } = await admin
      .from("leads")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      leadId = existingLead.id;
      await admin
        .from("leads")
        .update({
          status,
          notes,
          source: "voice",
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);
    } else {
      const { data: createdLead } = await admin
        .from("leads")
        .insert({
          organization_id: input.organizationId,
          contact_id: contactId,
          source: "voice",
          status,
          notes,
        })
        .select("id")
        .single();
      leadId = createdLead?.id ?? null;
    }

    if (leadId) {
      await admin.from("lead_activities").insert({
        organization_id: input.organizationId,
        lead_id: leadId,
        activity_type: "call_analyzed",
        payload: {
          call_id: input.callId,
          intent,
          summary: input.summary,
        },
      });
    }
  }

  const appointmentStart = asString(input.analysis.appointment_start);
  if (appointmentStart && contactId) {
    const starts = new Date(appointmentStart);
    if (!Number.isNaN(starts.getTime())) {
      const ends = new Date(starts.getTime() + 30 * 60 * 1000);
      await admin.from("appointments").insert({
        organization_id: input.organizationId,
        contact_id: contactId,
        status: "pending",
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        source: "ai",
        created_by_ai: true,
        notes: notes,
      });
    }
  }

  await admin
    .from("calls")
    .update({
      contact_id: contactId,
      lead_id: leadId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.callId);

  return { contactId, leadId };
}

/**
 * Upsert a call row (and optional summary/transcript/outcomes) from a Retell webhook payload.
 * Requires SUPABASE_SERVICE_ROLE_KEY. No-ops if not configured.
 */
export async function upsertCallFromRetellEvent(raw: unknown): Promise<{ callId: string | null }> {
  if (!getSupabaseEnv().configured || !getServiceRoleKey()) {
    return { callId: null };
  }

  const body = raw as { event?: string; call?: RetellCall };
  const call = body.call;
  if (!call?.call_id) return { callId: null };

  const admin = createAdminClient();
  const resolved = await resolveOrgFromAgentOrNumber(admin, call);
  const meta = call.metadata ?? {};
  const fromMeta =
    (typeof meta.organization_id === "string" && meta.organization_id) ||
    (typeof meta.organizationId === "string" && meta.organizationId) ||
    null;
  const organizationId =
    fromMeta || resolved?.organizationId || process.env.DEFAULT_WEBHOOK_ORG_ID?.trim() || null;

  if (!organizationId) {
    console.warn("[calls:write] missing organization_id on Retell call", call.call_id);
    return { callId: null };
  }

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
    agent_id: resolved?.agentId ?? null,
    phone_number_id: resolved?.phoneNumberId ?? null,
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

  if (body.event === "call_analyzed" || call.call_analysis) {
    try {
      await upsertContactAndLead(admin, {
        organizationId,
        callId,
        fromNumber: call.from_number ?? null,
        summary: summary ?? null,
        analysis: call.call_analysis?.custom_analysis_data ?? {},
      });
    } catch (err) {
      console.error("[calls:write] outcome capture failed", err);
    }
  }

  return { callId };
}
