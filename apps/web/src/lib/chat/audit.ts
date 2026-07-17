import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AvaAuditEvent = {
  id: string;
  organizationId: string;
  userId: string;
  pathname: string | null;
  model: string;
  toolsUsed: string[];
  citations: Array<{ label: string; path: string }>;
  userMessagePreview: string;
  assistantReplyPreview: string;
  usedFallback: boolean;
  guardReasons: string[];
  createdAt: string;
};

const memory: AvaAuditEvent[] = [];
const MAX_MEMORY = 500;

function preview(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

export async function writeAvaAuditEvent(input: {
  organizationId: string;
  userId: string;
  pathname?: string | null;
  model: string;
  toolsUsed: string[];
  citations: Array<{ label: string; path: string }>;
  userMessage: string;
  assistantReply: string;
  usedFallback: boolean;
  guardReasons: string[];
}): Promise<AvaAuditEvent> {
  const event: AvaAuditEvent = {
    id: `aud_${crypto.randomUUID().slice(0, 12)}`,
    organizationId: input.organizationId,
    userId: input.userId,
    pathname: input.pathname ?? null,
    model: input.model,
    toolsUsed: input.toolsUsed,
    citations: input.citations,
    userMessagePreview: preview(input.userMessage),
    assistantReplyPreview: preview(input.assistantReply),
    usedFallback: input.usedFallback,
    guardReasons: input.guardReasons,
    createdAt: new Date().toISOString(),
  };

  memory.unshift(event);
  if (memory.length > MAX_MEMORY) memory.length = MAX_MEMORY;

  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      // Table added via migration; types may lag generated Database until regenerate.
      await (supabase as unknown as {
        from: (table: string) => {
          insert: (values: Record<string, unknown>) => PromiseLike<unknown>;
        };
      })
        .from("ava_chat_audit_events")
        .insert({
          id: event.id,
          organization_id: event.organizationId,
          user_id: event.userId,
          pathname: event.pathname,
          model: event.model,
          tools_used: event.toolsUsed,
          citations: event.citations,
          user_message_preview: event.userMessagePreview,
          assistant_reply_preview: event.assistantReplyPreview,
          used_fallback: event.usedFallback,
          guard_reasons: event.guardReasons,
          created_at: event.createdAt,
        });
    } catch {
      // Best-effort — memory log remains.
    }
  }

  return event;
}

export function listAvaAuditEventsForOrg(organizationId: string, limit = 50): AvaAuditEvent[] {
  return memory.filter((e) => e.organizationId === organizationId).slice(0, limit);
}

export function __clearAvaAuditForTests() {
  memory.length = 0;
}
