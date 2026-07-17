import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { appendAvaHistory } from "@/lib/chat/history";
import { runAppAvaChat, type AvaStreamEvent } from "@/lib/chat/orchestrator";
import { normalizePathname } from "@/lib/chat/page-context";
import { sanitizeChatMessages } from "@/lib/marketing/chat-agent";

export const runtime = "nodejs";
export const maxDuration = 60;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

function encodeSse(event: AvaStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ctx = await getCurrentOrgContext();
  if (!ctx) {
    return new Response(
      JSON.stringify({
        error: "No active organization. Finish onboarding or switch organization.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!rateLimit(`${user.id}:${ctx.organization.id}`)) {
    return new Response(
      JSON.stringify({ error: "Too many messages. Please wait a moment and try again." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { messages?: unknown; pathname?: unknown; stream?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown; pathname?: unknown; stream?: unknown };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = sanitizeChatMessages(body.messages);
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Message is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return new Response(JSON.stringify({ error: "Last message must be from the user." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pathname = normalizePathname(body.pathname);
  const wantStream = body.stream !== false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        let finalReply = "";
        let finalCitations: Array<{ label: string; path: string }> = [];

        for await (const event of runAppAvaChat({
          ctx,
          userId: user.id,
          messages,
          pathname,
        })) {
          if (event.type === "done") {
            finalReply = event.reply;
            finalCitations = event.citations;
          }
          controller.enqueue(encoder.encode(encodeSse(event)));
        }

        const latestUser = messages[messages.length - 1];
        if (latestUser && finalReply) {
          appendAvaHistory(user.id, ctx.organization.id, [
            {
              id: `u-${crypto.randomUUID().slice(0, 8)}`,
              role: "user",
              content: latestUser.content,
              createdAt: new Date().toISOString(),
            },
            {
              id: `a-${crypto.randomUUID().slice(0, 8)}`,
              role: "assistant",
              content: finalReply,
              citations: finalCitations,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("[chat]", error instanceof Error ? error.message : "unknown error");
        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              error: "The AI agent is temporarily unavailable. Please try again in a moment.",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  if (!wantStream) {
    // Still SSE for one consumer path; clients should use stream=true.
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
