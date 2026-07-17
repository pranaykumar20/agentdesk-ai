"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, Send, Sparkles, Trash2, X } from "lucide-react";
import { ChatMarkdown } from "@/components/marketing/chat/ChatMarkdown";
import { playChatBeep, unlockChatAudio } from "@/lib/marketing/chat-beep";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import type { AvaCitation, ProposedAction } from "@/lib/chat/types";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AvaCitation[];
  proposedAction?: ProposedAction;
};

export type AvaChatSurface = "marketing" | "app";

const SURFACE_CONFIG: Record<
  AvaChatSurface,
  {
    welcome: string;
    starters: string[];
    subtitle: string;
    placeholder: string;
    autoOpen: boolean;
    storageKey: string;
  }
> = {
  marketing: {
    welcome:
      "Hi — I'm Ava, your AgentDesk AI assistant. Ask me anything about the product, pricing, integrations, or how AI employees work.",
    starters: [
      "What can AgentDesk AI do?",
      "How does pricing work?",
      "Can it book appointments?",
      "Book me a demo",
    ],
    subtitle: "Ask anything about AgentDesk",
    placeholder: "Ask Ava anything…",
    autoOpen: true,
    storageKey: "ava-chat-auto-opened",
  },
  app: {
    welcome:
      "Hi — I'm Ava, your in-app AgentDesk assistant. Ask about anything in your account — calls, appointments, invoices, phone numbers, team, CRM, integrations, locations, workflows, and more — or how to use the dashboard.",
    starters: [
      "How many total calls do I have?",
      "How many total invoices do I have?",
      "How many phone numbers do I have?",
      "What's my account overview?",
    ],
    subtitle: "Full account context",
    placeholder: "Ask about any account area…",
    autoOpen: false,
    storageKey: "ava-chat-app-dismissed",
  },
};

function historyStorageKey(orgHint: string) {
  return `ava-chat-history:${orgHint}`;
}

function markStorageHandled(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // ignore
  }
}

async function readSseChat(
  response: Response,
  onEvent: (event: {
    type: string;
    text?: string;
    reply?: string;
    citations?: AvaCitation[];
    proposedAction?: ProposedAction;
    error?: string;
  }) => void,
) {
  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(6)) as Parameters<typeof onEvent>[0]);
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export function AvaChatWidget({
  surface = "marketing",
  organizationId,
}: {
  surface?: AvaChatSurface;
  organizationId?: string;
}) {
  const config = SURFACE_CONFIG[surface];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: config.welcome,
    },
  ]);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoOpenTimerRef = useRef<number | null>(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    const unlock = () => unlockChatAudio();
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });

    if (!config.autoOpen) {
      return () => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
    }

    try {
      if (window.sessionStorage.getItem(config.storageKey) === "1") {
        return () => {
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
      }
    } catch {
      // ignore
    }

    autoOpenTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      markStorageHandled(config.storageKey);
      void playChatBeep();
      track("marketing_chat_opened", { source: "auto_open", surface });
      autoOpenTimerRef.current = null;
    }, 3000);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      if (autoOpenTimerRef.current != null) {
        window.clearTimeout(autoOpenTimerRef.current);
      }
    };
  }, [config.autoOpen, config.storageKey, surface]);

  useEffect(() => {
    if (surface !== "app" || historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    const orgHint = organizationId || "active";
    try {
      const raw = window.localStorage.getItem(historyStorageKey(orgHint));
      if (raw) {
        const parsed = JSON.parse(raw) as UiMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }

    void fetch("/api/chat/history", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            citations?: AvaCitation[];
          }>;
        };
        if (!data.messages?.length) return;
        setMessages([
          { id: "welcome", role: "assistant", content: config.welcome },
          ...data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations,
          })),
        ]);
      })
      .catch(() => {
        // ignore
      });
  }, [surface, organizationId, config.welcome]);

  useEffect(() => {
    if (surface !== "app") return;
    const orgHint = organizationId || "active";
    try {
      window.localStorage.setItem(historyStorageKey(orgHint), JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, surface, organizationId]);

  function closeChat() {
    setOpen(false);
    markStorageHandled(config.storageKey);
    if (autoOpenTimerRef.current != null) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [open, messages, loading]);

  async function clearHistory() {
    if (surface !== "app") {
      setMessages([{ id: "welcome", role: "assistant", content: config.welcome }]);
      return;
    }
    try {
      await fetch("/api/chat/history", { method: "DELETE", credentials: "same-origin" });
    } catch {
      // ignore
    }
    const orgHint = organizationId || "active";
    try {
      window.localStorage.removeItem(historyStorageKey(orgHint));
    } catch {
      // ignore
    }
    setMessages([{ id: "welcome", role: "assistant", content: config.welcome }]);
  }

  async function decideAction(actionId: string, decision: "confirm" | "cancel") {
    setActionBusy(actionId);
    setError(null);
    try {
      const res = await fetch("/api/chat/actions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, decision }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Action failed.");
      setMessages((prev) => [
        ...prev,
        {
          id: `a-action-${Date.now()}`,
          role: "assistant",
          content:
            decision === "confirm"
              ? data.message || "Done."
              : "Cancelled — no changes were made.",
        },
      ]);
      setMessages((prev) =>
        prev.map((m) =>
          m.proposedAction?.id === actionId ? { ...m, proposedAction: undefined } : m,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionBusy(null);
    }
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    setInput("");
    const userMessage: UiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);
    track("marketing_chat_message_sent", { surface });

    const assistantId = `a-${Date.now()}`;
    setStreamingId(assistantId);
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", citations: [] },
    ]);

    try {
      if (surface === "app") {
        const res = await fetch("/api/chat", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathname,
            stream: true,
            messages: nextMessages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Something went wrong.");
        }

        let assembled = "";
        let citations: AvaCitation[] = [];
        let proposedAction: ProposedAction | undefined;

        let streamError: string | null = null;
        await readSseChat(res, (event) => {
          if (event.type === "token" && typeof event.text === "string" && event.text.length > 0) {
            assembled += event.text;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assembled } : m)),
            );
          }
          if (event.type === "action" && event.proposedAction) {
            proposedAction = event.proposedAction;
          }
          if (event.type === "done") {
            if (typeof event.reply === "string" && event.reply.trim()) {
              assembled = event.reply;
            }
            citations = event.citations || [];
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: assembled,
                      citations,
                      proposedAction,
                    }
                  : m,
              ),
            );
          }
          if (event.type === "error") {
            streamError = event.error || "Something went wrong.";
          }
        });

        if (streamError) {
          throw new Error(streamError);
        }

        if (!assembled.trim()) {
          const fallback =
            "I couldn’t generate a reply for that. Try rephrasing, or open **Team** / **Calls** / **Billing** in the sidebar.";
          assembled = fallback;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fallback } : m)),
          );
        }
      } else {
        const res = await fetch("/api/public/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            messages: nextMessages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: data.reply?.trim() || "Sorry — I couldn't answer that just now.",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.trim()));
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setStreamingId(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          className="flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]"
          aria-label="AgentDesk AI chat assistant"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold leading-none">Ava · AI Agent</p>
                <p className="mt-1 text-xs text-primary-foreground/80">{config.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {surface === "app" ? (
                <button
                  type="button"
                  onClick={() => void clearHistory()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="Clear chat history"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeChat}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {message.role === "assistant" ? (
                    <>
                      {message.content ? (
                        <ChatMarkdown content={message.content} />
                      ) : streamingId === message.id ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Ava is thinking…
                        </span>
                      ) : null}
                      {message.citations && message.citations.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.citations.map((c) => (
                            <Link
                              key={`${c.path}-${c.label}`}
                              href={c.path}
                              className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                      {message.proposedAction ? (
                        <div className="mt-3 rounded-lg border border-border bg-background p-2.5">
                          <p className="text-xs font-medium text-foreground">
                            Confirm action
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {message.proposedAction.summary}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={actionBusy === message.proposedAction.id}
                              onClick={() =>
                                void decideAction(message.proposedAction!.id, "confirm")
                              }
                              className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={actionBusy === message.proposedAction.id}
                              onClick={() =>
                                void decideAction(message.proposedAction!.id, "cancel")
                              }
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {!loading && messages.length <= 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {config.starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void sendMessage(starter)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={config.placeholder}
                className="h-9 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
                maxLength={2000}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            markStorageHandled(config.storageKey);
            track("marketing_chat_opened", { source: "button", surface });
          }}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-16px_rgba(92,78,229,0.8)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-expanded={false}
          aria-label="Open AI chat"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Chat with Ava</span>
        </button>
      ) : null}
    </div>
  );
}
