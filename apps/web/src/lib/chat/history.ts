import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AvaHistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ label: string; path: string }>;
  createdAt: string;
};

type ThreadKey = string;

const threads = new Map<ThreadKey, AvaHistoryMessage[]>();
const MAX_MESSAGES = 40;

function key(userId: string, organizationId: string): ThreadKey {
  return `${userId}:${organizationId}`;
}

export function getAvaHistory(userId: string, organizationId: string): AvaHistoryMessage[] {
  return [...(threads.get(key(userId, organizationId)) ?? [])];
}

export function appendAvaHistory(
  userId: string,
  organizationId: string,
  messages: AvaHistoryMessage[],
): AvaHistoryMessage[] {
  const k = key(userId, organizationId);
  const prev = threads.get(k) ?? [];
  const next = [...prev, ...messages].slice(-MAX_MESSAGES);
  threads.set(k, next);

  if (getSupabaseEnv().configured) {
    void persistToSupabase(userId, organizationId, messages).catch(() => {
      // best-effort
    });
  }

  return next;
}

export function clearAvaHistory(userId: string, organizationId: string): void {
  threads.delete(key(userId, organizationId));
  if (getSupabaseEnv().configured) {
    void clearSupabase(userId, organizationId).catch(() => {
      // best-effort
    });
  }
}

type LooseSupabase = {
  from: (table: string) => {
    insert: (values: Record<string, unknown> | Record<string, unknown>[]) => PromiseLike<unknown>;
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => PromiseLike<unknown>;
      };
    };
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => {
            limit: (n: number) => PromiseLike<{
              data: Array<{
                id: string;
                role: string;
                content: string;
                citations: unknown;
                created_at: string;
              }> | null;
            }>;
          };
        };
      };
    };
  };
};

async function persistToSupabase(
  userId: string,
  organizationId: string,
  messages: AvaHistoryMessage[],
) {
  const supabase = (await createClient()) as unknown as LooseSupabase;
  await supabase.from("ava_chat_messages").insert(
    messages.map((m) => ({
      id: m.id,
      organization_id: organizationId,
      user_id: userId,
      role: m.role,
      content: m.content.slice(0, 4000),
      citations: m.citations ?? [],
      created_at: m.createdAt,
    })),
  );
}

async function clearSupabase(userId: string, organizationId: string) {
  const supabase = (await createClient()) as unknown as LooseSupabase;
  await supabase
    .from("ava_chat_messages")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId);
}

export async function loadAvaHistoryFromStore(
  userId: string,
  organizationId: string,
): Promise<AvaHistoryMessage[]> {
  const mem = getAvaHistory(userId, organizationId);
  if (mem.length > 0 || !getSupabaseEnv().configured) return mem;

  try {
    const supabase = (await createClient()) as unknown as LooseSupabase;
    const { data } = await supabase
      .from("ava_chat_messages")
      .select("id, role, content, citations, created_at")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(MAX_MESSAGES);

    if (!data?.length) return [];
    const mapped: AvaHistoryMessage[] = data.map((row) => ({
      id: row.id,
      role: row.role as "user" | "assistant",
      content: row.content,
      citations: (row.citations as AvaHistoryMessage["citations"]) ?? [],
      createdAt: row.created_at,
    }));
    threads.set(key(userId, organizationId), mapped);
    return mapped;
  } catch {
    return [];
  }
}

export function __clearAvaHistoryForTests() {
  threads.clear();
}
