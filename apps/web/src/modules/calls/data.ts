import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { buildDemoCallDetail, buildDemoCalls } from "./demo-data";
import type { CallDetail, CallListFilters, CallListItem, PaginatedResult } from "./types";

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

function filterDemoCalls(calls: CallListItem[], filters: CallListFilters): CallListItem[] {
  let result = [...calls];
  const tab = filters.tab ?? "all";
  if (tab === "answered") result = result.filter((c) => c.status === "completed");
  if (tab === "missed") result = result.filter((c) => c.status === "missed" || c.status === "no_answer");
  if (tab === "voicemails") result = result.filter((c) => c.status === "voicemail");

  const q = filters.q?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (c) =>
        c.callerName.toLowerCase().includes(q) ||
        c.callerPhone.toLowerCase().includes(q) ||
        (c.disposition?.toLowerCase().includes(q) ?? false),
    );
  }

  if (filters.disposition && filters.disposition !== "all") {
    result = result.filter((c) => c.disposition === filters.disposition);
  }

  return result;
}

async function listCallsFromSupabase(
  organizationId: string,
  filters: CallListFilters,
): Promise<PaginatedResult<CallListItem> | null> {
  if (!getSupabaseEnv().configured) return null;

  try {
    const supabase = await createClient();
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("calls")
      .select(
        "id, organization_id, direction, status, disposition, from_number, to_number, duration_seconds, started_at, sentiment, contact_id",
        { count: "exact" },
      )
      .eq("organization_id", organizationId)
      .order("started_at", { ascending: false });

    const tab = filters.tab ?? "all";
    if (tab === "answered") query = query.eq("status", "completed");
    if (tab === "missed") query = query.in("status", ["missed", "no_answer"]);
    if (tab === "voicemails") query = query.eq("status", "voicemail");
    if (filters.disposition && filters.disposition !== "all") {
      query = query.eq("disposition", filters.disposition);
    }

    const { data, error, count } = await query.range(from, to);
    if (error || !data) return null;

    const items: CallListItem[] = data.map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      callerName: row.from_number ?? "Unknown caller",
      callerPhone: row.from_number ?? "—",
      callerEmail: null,
      direction: row.direction as CallListItem["direction"],
      status: row.status as CallListItem["status"],
      disposition: row.disposition,
      agentName: "AI Agent - Ava",
      phoneNumber: row.to_number ?? "—",
      durationSeconds: row.duration_seconds,
      startedAt: row.started_at ?? row.id,
      sentiment: row.sentiment,
      tags: [],
    }));

    const total = count ?? items.length;
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch {
    return null;
  }
}

export async function listCalls(
  organizationId: string,
  filters: CallListFilters = {},
): Promise<PaginatedResult<CallListItem>> {
  const fromDb = await listCallsFromSupabase(organizationId, filters);
  if (fromDb && fromDb.total > 0) return fromDb;

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterDemoCalls(buildDemoCalls(organizationId), filters);
  return paginate(filtered, page, pageSize);
}

export async function getCallDetail(
  organizationId: string,
  callId: string,
): Promise<CallDetail | null> {
  const demo = buildDemoCalls(organizationId).find((c) => c.id === callId);
  if (demo) return buildDemoCallDetail(demo);

  if (!getSupabaseEnv().configured) return null;

  try {
    const supabase = await createClient();
    const { data: call, error } = await supabase
      .from("calls")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("id", callId)
      .maybeSingle();

    if (error || !call) return null;

    const { data: transcript } = await supabase
      .from("call_transcripts")
      .select("*")
      .eq("call_id", callId)
      .order("sort_order", { ascending: true });

    const { data: summary } = await supabase
      .from("call_summaries")
      .select("*")
      .eq("call_id", callId)
      .maybeSingle();

    const listItem: CallListItem = {
      id: call.id,
      organizationId: call.organization_id,
      callerName: call.from_number ?? "Unknown caller",
      callerPhone: call.from_number ?? "—",
      callerEmail: null,
      direction: call.direction as CallListItem["direction"],
      status: call.status as CallListItem["status"],
      disposition: call.disposition,
      agentName: "AI Agent - Ava",
      phoneNumber: call.to_number ?? "—",
      durationSeconds: call.duration_seconds,
      startedAt: call.started_at ?? call.created_at,
      sentiment: call.sentiment,
      tags: [],
    };

    return {
      ...listItem,
      notes: null,
      summary: summary?.summary ?? null,
      keyTopics: Array.isArray(summary?.key_topics)
        ? (summary.key_topics as Array<{ topic: string; weight: number }>)
        : [],
      insights: Array.isArray(summary?.insights) ? (summary.insights as string[]) : [],
      recordingAvailable: false,
      endedAt: call.ended_at,
      transcript: (transcript ?? []).map((t) => ({
        id: t.id,
        speaker: t.speaker === "caller" ? "caller" : "ai",
        displayName: t.speaker,
        content: t.content,
        startedAtMs: t.started_at_ms,
      })),
    };
  } catch {
    return null;
  }
}

export async function getRecentCalls(organizationId: string, limit = 5): Promise<CallListItem[]> {
  const result = await listCalls(organizationId, { page: 1, pageSize: limit });
  return result.items;
}
