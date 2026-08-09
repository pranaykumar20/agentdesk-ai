"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGENT_INDUSTRIES,
  AGENT_LANGUAGES,
  AGENT_ROLES,
  AGENT_TONES,
  voicesForLanguage,
} from "@/modules/agents/voice-options";
import { defaultCapabilities } from "@/modules/agents/capabilities";
import { EMPLOYEE_TEMPLATE_GALLERY } from "@/modules/agents/gallery";
import {
  buildRoleSystemPrompt,
  defaultGreetingForRole,
} from "@/modules/agents/role-templates";
import type { AiEmployeeSummary } from "@/modules/agents/types";
import { WizardSteps } from "./wizard/WizardSteps";
import { initialWizardState, type WizardState } from "./wizard/types";

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm";

export function CreateEmployeeWizard({
  businessName,
  existingEmployees,
}: {
  businessName: string;
  existingEmployees: AiEmployeeSummary[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState>(() =>
    initialWizardState({
      capabilities: defaultCapabilities(),
      voice: voicesForLanguage("en-US")[0]!.value,
    }),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptTouched, setPromptTouched] = useState(false);
  const [cloningId, setCloningId] = useState<string>("");

  const voices = useMemo(() => voicesForLanguage(state.language), [state.language]);
  const roleCtx = useMemo(
    () => ({
      agentName: state.name.trim() || "Ava",
      businessName,
      roleTitle: state.roleTitle,
      tone: state.tone,
      industry: state.industry,
      language: state.language,
    }),
    [state.name, state.roleTitle, state.tone, state.industry, state.language, businessName],
  );

  useEffect(() => {
    const stepParam = Number(searchParams.get("step") ?? "0");
    if (Number.isFinite(stepParam) && stepParam >= 0 && stepParam <= 6) {
      setState((s) => ({ ...s, step: stepParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (state.step !== 1 && state.step !== 2) return;
    if (promptTouched && state.systemPrompt) return;
    setState((s) => ({
      ...s,
      systemPrompt: buildRoleSystemPrompt(roleCtx),
      greeting: defaultGreetingForRole(roleCtx),
    }));
  }, [roleCtx, state.step, promptTouched, state.systemPrompt]);

  function go(step: number) {
    setError(null);
    setState((s) => ({ ...s, step }));
    const params = new URLSearchParams(searchParams.toString());
    if (step <= 0) params.delete("step");
    else params.set("step", String(step));
    router.replace(`/dashboard/ai-employees/new?${params.toString()}`);
  }

  function patch(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  async function createAgent() {
    setBusy(true);
    setError(null);
    try {
      const prompt = state.systemPrompt.trim() || buildRoleSystemPrompt(roleCtx);
      const greeting = state.greeting.trim() || defaultGreetingForRole(roleCtx);
      const res = await fetch("/api/ai-employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name.trim(),
          roleTitle: state.roleTitle,
          department: state.department,
          description: state.description,
          language: state.language,
          voice: state.voice,
          tone: state.tone,
          industry: state.industry,
          greeting,
          systemPrompt: prompt,
          capabilities: state.capabilities,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Failed to create employee");
      patch({ agentId: data.id, systemPrompt: prompt, greeting });
      go(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraftPrompt() {
    if (!state.agentId) throw new Error("Missing agent id");
    const res = await fetch("/api/ai-agent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_draft",
        id: state.agentId,
        name: state.name,
        roleTitle: state.roleTitle,
        description: state.description,
        greeting: state.greeting,
        systemPrompt: state.systemPrompt,
        tone: state.tone,
        voice: state.voice,
        language: state.language,
        capabilities: state.capabilities,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to save prompt");
  }

  async function generatePrompt() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-employees/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: state.name,
          roleTitle: state.roleTitle,
          industry: state.industry,
          tone: state.tone,
          language: state.language,
          brief: state.brief,
          capabilities: state.capabilities,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        systemPrompt?: string;
        greeting?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Prompt generation failed");
      patch({
        systemPrompt: data.systemPrompt ?? state.systemPrompt,
        greeting: data.greeting ?? state.greeting,
      });
      setPromptTouched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function seedKnowledge() {
    if (!state.agentId) throw new Error("Missing agent id");
    const faqs = state.faqs.filter((f) => f.question.trim() && f.answer.trim());
    if (state.hours.trim()) {
      // Store hours as a FAQ-style policy via FAQ create for sync simplicity.
      faqs.unshift({
        question: "What are your business hours?",
        answer: state.hours.trim(),
      });
    }
    for (const faq of faqs) {
      const res = await fetch("/api/knowledge/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          category: "Onboarding",
          agentId: state.agentId,
          syncAgents: false,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save FAQ");
    }
    if (faqs.length > 0) {
      const syncRes = await fetch("/api/knowledge/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: state.agentId }),
      });
      const syncData = (await syncRes.json()) as { error?: string };
      if (!syncRes.ok) throw new Error(syncData.error ?? "Knowledge sync failed");
    }
  }

  async function provisionPhone() {
    if (!state.agentId) throw new Error("Missing agent id");
    const res = await fetch("/api/phone-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areaCode: state.areaCode, agentId: state.agentId }),
    });
    const data = (await res.json()) as {
      error?: string;
      number?: { e164?: string };
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to provision number");
    patch({ phoneE164: data.number?.e164 ?? null });
  }

  async function startTestCall() {
    if (!state.agentId) throw new Error("Missing agent id");
    const res = await fetch("/api/ai-employees/test-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: state.agentId,
        toNumber: state.testPhone,
        fromNumber: state.phoneE164 ?? undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Test call failed");
  }

  async function publishAndFinish() {
    if (!state.agentId) throw new Error("Missing agent id");
    await saveDraftPrompt();
    const res = await fetch("/api/ai-agent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", id: state.agentId }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Publish failed");
    router.push(`/dashboard/ai-employees/${state.agentId}`);
    router.refresh();
  }

  async function saveDraftAndExit() {
    if (!state.agentId) {
      router.push("/dashboard/ai-employees");
      return;
    }
    await saveDraftPrompt();
    router.push(`/dashboard/ai-employees/${state.agentId}`);
    router.refresh();
  }

  async function cloneEmployee() {
    if (!cloningId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-employees/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cloningId }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Clone failed");
      router.push(`/dashboard/ai-employees/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setBusy(false);
    }
  }

  // Gallery
  if (state.step === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Start from a template</CardTitle>
            <CardDescription>
              Pick a role × industry pack, or clone an existing AI employee.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {EMPLOYEE_TEMPLATE_GALLERY.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary"
                  onClick={() => {
                    setPromptTouched(false);
                    patch({
                      step: 1,
                      roleTitle: card.roleTitle,
                      industry: card.industry,
                      tone: card.tone,
                      language: card.language,
                      department: card.department,
                      voice: voicesForLanguage(card.language)[0]!.value,
                      name: card.roleTitle === "Receptionist" ? "Ava" : "Riley",
                      description: card.description,
                    });
                    router.replace("/dashboard/ai-employees/new?step=1");
                  }}
                >
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-primary">
                    {card.roleTitle} · {card.industry}
                    {card.language === "te-IN" ? " · Telugu" : ""}
                  </p>
                </button>
              ))}
            </div>

            {existingEmployees.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-border p-4">
                <Label htmlFor="clone-source">Clone existing employee</Label>
                <div className="flex flex-wrap gap-2">
                  <select
                    id="clone-source"
                    className={selectClassName}
                    value={cloningId}
                    onChange={(e) => setCloningId(e.target.value)}
                  >
                    <option value="">Select employee…</option>
                    {existingEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.roleTitle})
                      </option>
                    ))}
                  </select>
                  <Button type="button" disabled={busy || !cloningId} onClick={() => void cloneEmployee()}>
                    {busy ? "Cloning…" : "Clone"}
                  </Button>
                </div>
              </div>
            ) : null}

            <Button type="button" variant="outline" onClick={() => go(1)}>
              Start blank
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <WizardSteps step={state.step} />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>
            {state.step === 1 && "Basics"}
            {state.step === 2 && "Training prompt"}
            {state.step === 3 && "Seed knowledge"}
            {state.step === 4 && "Phone number"}
            {state.step === 5 && "Test call"}
            {state.step === 6 && "Review & publish"}
          </CardTitle>
          <CardDescription>
            Step {state.step} of 6 — build, train, and optionally go live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="name">Employee name</Label>
                <Input id="name" value={state.name} onChange={(e) => patch({ name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className={selectClassName}
                  value={state.roleTitle}
                  onChange={(e) => {
                    setPromptTouched(false);
                    patch({ roleTitle: e.target.value });
                  }}
                >
                  {AGENT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  className={selectClassName}
                  value={state.industry}
                  onChange={(e) => {
                    setPromptTouched(false);
                    patch({ industry: e.target.value });
                  }}
                >
                  {AGENT_INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  className={selectClassName}
                  value={state.tone}
                  onChange={(e) => {
                    setPromptTouched(false);
                    patch({ tone: e.target.value });
                  }}
                >
                  {AGENT_TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={state.department}
                  onChange={(e) => patch({ department: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className={selectClassName}
                  value={state.language}
                  onChange={(e) => {
                    const language = e.target.value;
                    setPromptTouched(false);
                    patch({ language, voice: voicesForLanguage(language)[0]!.value });
                  }}
                >
                  {AGENT_LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                {state.language === "te-IN" ? (
                  <p className="text-xs text-muted-foreground">
                    Telugu mode uses Deepgram STT + Azure Telugu voices and adds spoken-language
                    guidance to the prompt.
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="voice">Voice</Label>
                <select
                  id="voice"
                  className={selectClassName}
                  value={state.voice}
                  onChange={(e) => patch({ voice: e.target.value })}
                >
                  {voices.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={state.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Capabilities</Label>
                <ul className="space-y-2">
                  {state.capabilities.map((cap, idx) => (
                    <li key={cap.key} className="flex items-start gap-2 rounded-lg border border-border p-2">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={cap.enabled}
                        onChange={(e) => {
                          const capabilities = state.capabilities.map((c, i) =>
                            i === idx ? { ...c, enabled: e.target.checked } : c,
                          );
                          patch({ capabilities });
                        }}
                      />
                      <span>
                        <p className="text-sm font-medium">{cap.title}</p>
                        <p className="text-xs text-muted-foreground">{cap.description}</p>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {state.step === 2 ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="greeting">Greeting</Label>
                <Input
                  id="greeting"
                  value={state.greeting}
                  onChange={(e) => {
                    setPromptTouched(true);
                    patch({ greeting: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="brief">Brief for AI customize (optional)</Label>
                <Textarea
                  id="brief"
                  rows={3}
                  value={state.brief}
                  onChange={(e) => patch({ brief: e.target.value })}
                  placeholder="Add business-specific details to weave into the role prompt…"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPromptTouched(false);
                    patch({
                      systemPrompt: buildRoleSystemPrompt(roleCtx),
                      greeting: defaultGreetingForRole(roleCtx),
                    });
                  }}
                >
                  Reload role template
                </Button>
                <Button type="button" size="sm" disabled={busy} onClick={() => void generatePrompt()}>
                  {busy ? "Generating…" : "Generate with AI"}
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor="systemPrompt">System prompt</Label>
                <textarea
                  id="systemPrompt"
                  className="min-h-72 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
                  value={state.systemPrompt}
                  onChange={(e) => {
                    setPromptTouched(true);
                    patch({ systemPrompt: e.target.value });
                  }}
                />
              </div>
            </div>
          ) : null}

          {state.step === 3 ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="hours">Business hours</Label>
                <Textarea
                  id="hours"
                  rows={3}
                  value={state.hours}
                  onChange={(e) => patch({ hours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Starter FAQs</Label>
                {state.faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1 rounded-lg border border-border p-3">
                    <Input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => {
                        const faqs = state.faqs.map((f, i) =>
                          i === idx ? { ...f, question: e.target.value } : f,
                        );
                        patch({ faqs });
                      }}
                    />
                    <Textarea
                      placeholder="Answer"
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const faqs = state.faqs.map((f, i) =>
                          i === idx ? { ...f, answer: e.target.value } : f,
                        );
                        patch({ faqs });
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => patch({ faqs: [...state.faqs, { question: "", answer: "" }] })}
                >
                  + Add FAQ
                </Button>
              </div>
            </div>
          ) : null}

          {state.step === 4 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Provision a number and bind it to this draft employee (Vapi/Retell). You can skip and
                add a number later.
              </p>
              <div className="space-y-1">
                <Label htmlFor="areaCode">Area code</Label>
                <Input
                  id="areaCode"
                  value={state.areaCode}
                  onChange={(e) => patch({ areaCode: e.target.value })}
                />
              </div>
              {state.phoneE164 ? (
                <p className="text-sm font-medium text-foreground">Assigned: {state.phoneE164}</p>
              ) : null}
            </div>
          ) : null}

          {state.step === 5 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Place an outbound test call to your phone. A provisioned from-number helps; otherwise
                the provider default is used when configured.
              </p>
              <div className="space-y-1">
                <Label htmlFor="testPhone">Your phone (E.164)</Label>
                <Input
                  id="testPhone"
                  placeholder="+15135551234"
                  value={state.testPhone}
                  onChange={(e) => patch({ testPhone: e.target.value })}
                />
              </div>
            </div>
          ) : null}

          {state.step === 6 ? (
            <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span> {state.name}
              </p>
              <p>
                <span className="text-muted-foreground">Role / industry:</span> {state.roleTitle} ·{" "}
                {state.industry}
              </p>
              <p>
                <span className="text-muted-foreground">Language / voice:</span> {state.language} ·{" "}
                {state.voice}
              </p>
              <p>
                <span className="text-muted-foreground">Capabilities:</span>{" "}
                {state.capabilities.filter((c) => c.enabled).map((c) => c.title).join(", ") || "None"}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span> {state.phoneE164 ?? "Skipped"}
              </p>
              <p>
                <span className="text-muted-foreground">Knowledge FAQs staged:</span>{" "}
                {state.faqs.filter((f) => f.question && f.answer).length}
                {state.hours.trim() ? " (+ hours)" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Publish makes this employee live in AgentDesk and refreshes Vapi. Save draft keeps it
                unpublished.
              </p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-2 pt-2">
            {state.step > 1 ? (
              <Button type="button" variant="outline" disabled={busy} onClick={() => go(state.step - 1)}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled={busy} onClick={() => go(0)}>
                Templates
              </Button>
            )}

            {state.step === 1 ? (
              <Button
                type="button"
                disabled={busy || !state.name.trim()}
                onClick={() => {
                  if (state.agentId) {
                    go(2);
                    return;
                  }
                  void createAgent();
                }}
              >
                {busy ? "Creating…" : state.agentId ? "Continue" : "Create & continue"}
              </Button>
            ) : null}

            {state.step === 2 ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    setError(null);
                    try {
                      await saveDraftPrompt();
                      go(3);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Save failed");
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
              >
                {busy ? "Saving…" : "Save prompt & continue"}
              </Button>
            ) : null}

            {state.step === 3 ? (
              <>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await seedKnowledge();
                        go(4);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Knowledge seed failed");
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  {busy ? "Saving…" : "Save knowledge & continue"}
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => go(4)}>
                  Skip
                </Button>
              </>
            ) : null}

            {state.step === 4 ? (
              <>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await provisionPhone();
                        go(5);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Phone provision failed");
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  {busy ? "Provisioning…" : "Provision & continue"}
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => go(5)}>
                  Skip
                </Button>
              </>
            ) : null}

            {state.step === 5 ? (
              <>
                <Button
                  type="button"
                  disabled={busy || !state.testPhone.trim()}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await startTestCall();
                        go(6);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Test call failed");
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  {busy ? "Calling…" : "Start test call & continue"}
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => go(6)}>
                  Skip
                </Button>
              </>
            ) : null}

            {state.step === 6 ? (
              <>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await publishAndFinish();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Publish failed");
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  {busy ? "Publishing…" : "Publish & finish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await saveDraftAndExit();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Save failed");
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  Save draft & exit
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
