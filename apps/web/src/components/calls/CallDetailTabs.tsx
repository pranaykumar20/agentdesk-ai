"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import type { CallDetail } from "@/modules/calls/types";
import { formatMsTimestamp } from "@/lib/formatting/datetime";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "summary", label: "Call Summary" },
  { id: "analysis", label: "Analysis" },
  { id: "timeline", label: "Event Timeline" },
] as const;

export function CallDetailTabs({ call }: { call: CallDetail }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("transcript");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return call.transcript;
    return call.transcript.filter((m) => m.content.toLowerCase().includes(q));
  }, [call.transcript, query]);

  async function copyTranscript() {
    const text = call.transcript.map((m) => `${m.displayName}: ${m.content}`).join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                tab === t.id ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "transcript" ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="transcript-search">
              Search transcript
            </label>
            <input
              id="transcript-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transcript..."
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => void copyTranscript()}>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </Button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                call.transcript.map((m) => `${m.displayName}: ${m.content}`).join("\n"),
              )}`}
              download={`${call.id}-transcript.txt`}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download
            </a>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        {tab === "transcript" ? (
          <ul className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {filtered.map((msg) => {
              const isAi = msg.speaker === "ai";
              return (
                <li
                  key={msg.id}
                  className={cn("flex", isAi ? "justify-start" : "justify-end")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      isAi ? "bg-accent text-foreground" : "bg-emerald-50 text-foreground",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span>{msg.displayName}</span>
                      <span>{formatMsTimestamp(msg.startedAtMs)}</span>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {tab === "summary" ? (
          <div className="space-y-3 text-sm leading-relaxed text-foreground">
            <p>{call.summary ?? "No summary available for this call."}</p>
            {call.notes ? (
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
                <span className="font-medium text-foreground">Notes: </span>
                {call.notes}
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "analysis" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Key topics</h3>
              <ul className="mt-3 space-y-2">
                {call.keyTopics.map((topic) => (
                  <li key={topic.topic}>
                    <div className="flex justify-between text-sm">
                      <span>{topic.topic}</span>
                      <span className="text-muted-foreground">{topic.weight}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${topic.weight}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sentiment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {call.sentiment === "positive"
                  ? "The caller was satisfied with the interaction."
                  : call.sentiment
                    ? `Sentiment: ${call.sentiment}`
                    : "Sentiment unavailable."}
              </p>
            </div>
          </div>
        ) : null}

        {tab === "timeline" ? (
          <ol className="space-y-3 text-sm">
            <li className="rounded-lg border border-border px-3 py-2">Call started · {call.startedAt}</li>
            <li className="rounded-lg border border-border px-3 py-2">AI agent Ava answered</li>
            {call.disposition ? (
              <li className="rounded-lg border border-border px-3 py-2">Disposition set · {call.disposition}</li>
            ) : null}
            <li className="rounded-lg border border-border px-3 py-2">Call ended · {call.endedAt ?? "—"}</li>
          </ol>
        ) : null}
      </div>
    </div>
  );
}
