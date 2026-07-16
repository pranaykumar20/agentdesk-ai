"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AiAgent } from "@/modules/agents/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function AgentEditor({ agent }: { agent: AiAgent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: agent.name,
    roleTitle: agent.roleTitle,
    description: agent.description,
    greeting: agent.draft.greeting,
    systemPrompt: agent.draft.systemPrompt,
    tone: agent.draft.tone,
    voice: agent.voice,
    language: agent.language,
  });

  function save(action: "save_draft" | "publish") {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/ai-agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setMessage(action === "publish" ? "Published new version. Live agent updated." : "Draft saved. Live agent unchanged.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">Draft v{agent.draft.versionNumber}</Badge>
        {agent.published ? (
          <Badge variant="default">Published v{agent.published.versionNumber}</Badge>
        ) : (
          <Badge variant="secondary">No published version</Badge>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Agent name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="roleTitle">Business role</Label>
          <Input id="roleTitle" value={form.roleTitle} onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="voice">Voice</Label>
          <Input id="voice" value={form.voice} onChange={(e) => setForm((f) => ({ ...f, voice: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="language">Language</Label>
          <Input id="language" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tone">Tone</Label>
          <Input id="tone" value={form.tone} onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="greeting">Greeting</Label>
          <Input id="greeting" value={form.greeting} onChange={(e) => setForm((f) => ({ ...f, greeting: e.target.value }))} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="systemPrompt">System prompt (draft)</Label>
          <textarea
            id="systemPrompt"
            className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={form.systemPrompt}
            onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Capabilities</h3>
        <ul className="mt-3 space-y-2">
          {agent.capabilities.map((cap) => (
            <li key={cap.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{cap.title}</p>
                <p className="text-xs text-muted-foreground">{cap.description}</p>
              </div>
              <Badge variant={cap.enabled ? "success" : "secondary"}>
                {cap.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={pending} onClick={() => save("save_draft")}>
          Save draft
        </Button>
        <Button type="button" disabled={pending} onClick={() => save("publish")}>
          Publish version
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
