"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { ChatMarkdown } from "@/components/marketing/chat/ChatMarkdown";
import { playChatBeep, unlockChatAudio } from "@/lib/marketing/chat-beep";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "What can AgentDesk AI do?",
  "How does pricing work?",
  "Can it book appointments?",
  "Book me a demo",
];

const AUTO_OPEN_KEY = "ava-chat-auto-opened";

function markAutoOpenHandled() {
  try {
    window.sessionStorage.setItem(AUTO_OPEN_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

export function MarketingChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I'm Ava, your AgentDesk AI assistant. Ask me anything about the product, pricing, integrations, or how AI employees work.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoOpenTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const unlock = () => unlockChatAudio();
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });

    try {
      if (window.sessionStorage.getItem(AUTO_OPEN_KEY) === "1") {
        return () => {
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
      }
    } catch {
      // ignore storage failures
    }

    autoOpenTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      markAutoOpenHandled();
      void playChatBeep();
      track("marketing_chat_opened", { source: "auto_open" });
      autoOpenTimerRef.current = null;
    }, 3000);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      if (autoOpenTimerRef.current != null) {
        window.clearTimeout(autoOpenTimerRef.current);
      }
    };
  }, []);

  function closeChat() {
    setOpen(false);
    markAutoOpenHandled();
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
    track("marketing_chat_message_sent");

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply?.trim() || "Sorry — I couldn't answer that just now.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
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
                <p className="mt-1 text-xs text-primary-foreground/80">Ask anything about AgentDesk</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
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
                      ? "rounded-br-md bg-primary text-primary-foreground whitespace-pre-wrap"
                      : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {message.role === "assistant" ? (
                    <ChatMarkdown content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Ava is thinking…
                </div>
              </div>
            ) : null}

            {!loading && messages.length <= 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((starter) => (
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
                placeholder="Ask Ava anything…"
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
            markAutoOpenHandled();
            track("marketing_chat_opened", { source: "button" });
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
