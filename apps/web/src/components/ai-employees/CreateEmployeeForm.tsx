"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm";

export function CreateEmployeeForm({
  businessName = "your business",
}: {
  businessName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Ava");
  const [roleTitle, setRoleTitle] = useState<string>(AGENT_ROLES[0]);
  const [tone, setTone] = useState<string>(AGENT_TONES[0]);
  const [language, setLanguage] = useState<string>("en-US");
  const voices = useMemo(() => voicesForLanguage(language), [language]);
  const [voice, setVoice] = useState(voices[0]!.value);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [promptTouched, setPromptTouched] = useState(false);

  const roleCtx = useMemo(
    () => ({
      agentName: name.trim() || "Ava",
      businessName,
      roleTitle,
      tone,
    }),
    [name, businessName, roleTitle, tone],
  );

  // Keep preview in sync with role/name/tone until the user edits the prompt manually.
  useEffect(() => {
    if (promptTouched) return;
    setSystemPrompt(buildRoleSystemPrompt(roleCtx));
  }, [roleCtx, promptTouched]);

  function reloadRolePrompt() {
    setSystemPrompt(buildRoleSystemPrompt(roleCtx));
    setPromptTouched(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/ai-employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          roleTitle,
          department: form.get("department"),
          description: form.get("description"),
          language,
          voice,
          greeting: defaultGreetingForRole(roleCtx),
          systemPrompt: systemPrompt.trim(),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Failed to create AI employee");
        return;
      }
      router.push(`/dashboard/ai-employees/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create AI employee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Create AI employee</CardTitle>
        <CardDescription>
          Choose a role to preview the full training prompt (behavior, flow, guardrails). Edit it
          before create if you want. Knowledge Base facts are added later into the{" "}
          <code className="text-[11px]">## Knowledge Base</code> section.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Employee name</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ava"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleTitle">Role</Label>
            <select
              id="roleTitle"
              name="roleTitle"
              required
              className={selectClassName}
              value={roleTitle}
              onChange={(e) => {
                setRoleTitle(e.target.value);
                setPromptTouched(false);
              }}
            >
              {AGENT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" defaultValue="Front Office" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tone">Tone</Label>
            <select
              id="tone"
              className={selectClassName}
              value={tone}
              onChange={(e) => {
                setTone(e.target.value);
                setPromptTouched(false);
              }}
            >
              {AGENT_TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              name="language"
              className={selectClassName}
              value={language}
              onChange={(e) => {
                const next = e.target.value;
                setLanguage(next);
                setVoice(voicesForLanguage(next)[0]!.value);
              }}
            >
              {AGENT_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            {language === "te-IN" ? (
              <p className="text-xs text-muted-foreground">
                Telugu uses Deepgram speech recognition and Azure neural voices.
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="voice">Voice</Label>
            <select
              id="voice"
              name="voice"
              className={selectClassName}
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            >
              {voices.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Handles inbound calls, books appointments, and answers FAQs."
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="systemPrompt">System prompt (training)</Label>
              <Button type="button" size="sm" variant="outline" onClick={reloadRolePrompt}>
                Reload {roleTitle} template
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Updates automatically when you change name, role, or tone — until you edit the text
              yourself.
            </p>
            <textarea
              id="systemPrompt"
              className="min-h-72 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                setPromptTouched(true);
              }}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={loading || !systemPrompt.trim()}>
              {loading ? "Creating…" : "Create employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/ai-employees")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
