"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AiAgent } from "@/modules/agents/types";
import {
  AGENT_LANGUAGES,
  AGENT_ROLES,
  AGENT_TONES,
  voicesForLanguage,
} from "@/modules/agents/voice-options";
import {
  buildRoleSystemPrompt,
  defaultGreetingForRole,
} from "@/modules/agents/role-templates";
import { DEFAULT_CAPABILITY_DEFS } from "@/modules/agents/capabilities";
import type { AgentCapability } from "@/modules/agents/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm";

function initialCapabilities(agent: AiAgent): AgentCapability[] {
  const byKey = new Map(agent.capabilities.map((c) => [c.key, c]));
  return DEFAULT_CAPABILITY_DEFS.map((def) => {
    const existing = byKey.get(def.key);
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      enabled: existing?.enabled ?? true,
    };
  });
}

export function AgentEditor({
  agent,
  businessName = "your business",
}: {
  agent: AiAgent;
  businessName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<AgentCapability[]>(() =>
    initialCapabilities(agent),
  );
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
  const voices = useMemo(() => voicesForLanguage(form.language), [form.language]);
  const roleOptions = useMemo(() => {
    const roles = [...AGENT_ROLES] as string[];
    if (form.roleTitle && !roles.includes(form.roleTitle)) roles.unshift(form.roleTitle);
    return roles;
  }, [form.roleTitle]);
  const toneOptions = useMemo(() => {
    const tones = [...AGENT_TONES] as string[];
    if (form.tone && !tones.includes(form.tone)) tones.unshift(form.tone);
    return tones;
  }, [form.tone]);

  function applyRoleTrainingPrompt() {
    const ok = window.confirm(
      `Replace the system prompt with the ${form.roleTitle} training template? Your Knowledge Base facts will be re-attached on the next save.`,
    );
    if (!ok) return;
    const ctx = {
      agentName: form.name.trim() || agent.name,
      businessName,
      roleTitle: form.roleTitle,
      tone: form.tone,
    };
    setForm((f) => ({
      ...f,
      systemPrompt: buildRoleSystemPrompt(ctx),
      greeting: defaultGreetingForRole(ctx),
    }));
    setMessage(
      `Loaded ${form.roleTitle} training prompt. Save draft to sync to Vapi (Knowledge Base facts merge automatically).`,
    );
  }

  function save(action: "save_draft" | "publish") {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai-agent", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, id: agent.id, ...form, capabilities }),
        });
        const text = await res.text();
        const data = (text ? JSON.parse(text) : {}) as { error?: string };
        if (!res.ok) {
          setMessage(data.error ?? "Save failed");
          return;
        }
        setMessage(
          action === "publish"
            ? "Published new version. Live agent updated on Vapi."
            : "Draft saved and synced to Vapi.",
        );
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
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
          <select
            id="roleTitle"
            className={selectClassName}
            value={form.roleTitle}
            onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            className={selectClassName}
            value={form.language}
            onChange={(e) => {
              const language = e.target.value;
              setForm((f) => ({
                ...f,
                language,
                voice: voicesForLanguage(language)[0]!.value,
              }));
            }}
          >
            {AGENT_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="voice">Voice</Label>
          <select
            id="voice"
            className={selectClassName}
            value={form.voice}
            onChange={(e) => setForm((f) => ({ ...f, voice: e.target.value }))}
          >
            {!voices.some((v) => v.value === form.voice) ? (
              <option value={form.voice}>{form.voice}</option>
            ) : null}
            {voices.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="tone">Tone</Label>
          <select
            id="tone"
            className={selectClassName}
            value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
          >
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="greeting">Greeting</Label>
          <Input id="greeting" value={form.greeting} onChange={(e) => setForm((f) => ({ ...f, greeting: e.target.value }))} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="systemPrompt">System prompt (draft)</Label>
            <Button type="button" size="sm" variant="outline" onClick={applyRoleTrainingPrompt}>
              Load {form.roleTitle} training prompt
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Role templates include identity, conversation flow, and guardrails. The{" "}
            <code className="text-[11px]">## Knowledge Base</code> section is filled from Knowledge
            Base FAQs/docs when you save knowledge or save this agent.
          </p>
          <textarea
            id="systemPrompt"
            className="min-h-64 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            value={form.systemPrompt}
            onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Capabilities</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Toggles update the live prompt on save (Enabled / Disabled capabilities blocks).
        </p>
        <ul className="mt-3 space-y-2">
          {capabilities.map((cap) => (
            <li key={cap.key} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{cap.title}</p>
                <p className="text-xs text-muted-foreground">{cap.description}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={cap.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setCapabilities((prev) =>
                      prev.map((c) => (c.key === cap.key ? { ...c, enabled } : c)),
                    );
                  }}
                />
                {cap.enabled ? "Enabled" : "Off"}
              </label>
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
      {message ? (
        <p
          className={`text-sm ${
            /failed|error|must be|invalid|forbidden/i.test(message)
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
