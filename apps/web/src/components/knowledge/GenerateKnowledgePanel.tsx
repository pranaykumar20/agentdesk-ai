"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { KnowledgeAgentOption } from "./AgentSelect";
import type { GeneratedArticleDraft, GeneratedFaqDraft } from "@/modules/knowledge/generate";

type DraftFaq = GeneratedFaqDraft & { selected: boolean };

export function GenerateKnowledgePanel({ agents }: { agents: KnowledgeAgentOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [faqCount, setFaqCount] = useState(5);
  const [agentId, setAgentId] = useState("");
  const [includeArticle, setIncludeArticle] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<DraftFaq[]>([]);
  const [article, setArticle] = useState<GeneratedArticleDraft | null>(null);
  const [saveArticle, setSaveArticle] = useState(true);

  async function onGenerate() {
    setGenerating(true);
    setError(null);
    setFaqs([]);
    setArticle(null);
    try {
      const agentName = agents.find((a) => a.id === agentId)?.name;
      const res = await fetch("/api/knowledge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "batch",
          requirements,
          faqCount,
          includeArticle,
          agentName,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        faqs?: GeneratedFaqDraft[];
        article?: GeneratedArticleDraft | null;
      };
      if (!res.ok) {
        setError(data.error ?? "AI generation failed");
        return;
      }
      setFaqs((data.faqs ?? []).map((f) => ({ ...f, selected: true })));
      setArticle(data.article ?? null);
      setSaveArticle(Boolean(data.article));
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function onSaveSelected() {
    setSaving(true);
    setError(null);
    const selected = faqs.filter((f) => f.selected);
    if (selected.length === 0 && !(article && saveArticle)) {
      setError("Select at least one FAQ or the article draft to save.");
      setSaving(false);
      return;
    }

    try {
      const assignedAgentId = agentId || null;
      for (const faq of selected) {
        const res = await fetch("/api/knowledge/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            agentId: assignedAgentId,
            syncAgents: false,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to save FAQ");
      }

      if (article && saveArticle) {
        const byteSize = new TextEncoder().encode(article.summary).length;
        const res = await fetch("/api/knowledge/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            category: article.category,
            mimeType: "text/plain",
            byteSize,
            agentId: assignedAgentId,
            syncAgents: false,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to save article");
      }

      const syncRes = await fetch("/api/knowledge/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: assignedAgentId }),
      });
      const syncData = (await syncRes.json()) as { error?: string; errors?: string[] };
      if (!syncRes.ok) {
        throw new Error(
          syncData.error ??
            syncData.errors?.join("; ") ??
            "Saved knowledge, but failed to sync agents to Vapi",
        );
      }

      setOpen(false);
      setFaqs([]);
      setArticle(null);
      setRequirements("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save drafts");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Generate with AI
      </Button>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Generate knowledge with AI</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Describe hours, menu, policies, or reservation rules. AI drafts FAQs (and an optional
          article summary) you can edit before saving.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="kb-ai-requirements">Requirements</Label>
        <Textarea
          id="kb-ai-requirements"
          rows={6}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Example: Tikka House is open Tue–Sun 11am–10pm, closed Monday. We take reservations for parties of 4+. Vegetarian and spicy options available. Parking in the lot behind the restaurant..."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="kb-ai-count">Number of FAQs</Label>
          <Input
            id="kb-ai-count"
            type="number"
            min={1}
            max={8}
            value={faqCount}
            onChange={(e) => setFaqCount(Number(e.target.value) || 5)}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={includeArticle}
              onChange={(e) => setIncludeArticle(e.target.checked)}
            />
            Include article summary
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="kb-ai-agent">Assign drafts to</Label>
        <select
          id="kb-ai-agent"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        >
          <option value="">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {faqs.length > 0 || article ? (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Review drafts
          </p>
          <ul className="space-y-3">
            {faqs.map((faq, index) => (
              <li key={`${faq.question}-${index}`} className="rounded-md border border-border/70 p-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={faq.selected}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, selected: e.target.checked } : f,
                        ),
                      )
                    }
                  />
                  <span className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={faq.question}
                      onChange={(e) =>
                        setFaqs((prev) =>
                          prev.map((f, i) =>
                            i === index ? { ...f, question: e.target.value } : f,
                          ),
                        )
                      }
                    />
                    <Textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) =>
                        setFaqs((prev) =>
                          prev.map((f, i) =>
                            i === index ? { ...f, answer: e.target.value } : f,
                          ),
                        )
                      }
                    />
                    <Input
                      value={faq.category}
                      onChange={(e) =>
                        setFaqs((prev) =>
                          prev.map((f, i) =>
                            i === index ? { ...f, category: e.target.value } : f,
                          ),
                        )
                      }
                    />
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {article ? (
            <div className="rounded-md border border-border/70 p-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={saveArticle}
                  onChange={(e) => setSaveArticle(e.target.checked)}
                />
                <span className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">{article.category}</p>
                  <p className="text-xs text-muted-foreground">{article.summary}</p>
                </span>
              </label>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={generating || requirements.trim().length < 20}
          onClick={() => void onGenerate()}
        >
          {generating ? "Generating…" : faqs.length ? "Regenerate" : "Generate drafts"}
        </Button>
        {faqs.length > 0 || article ? (
          <Button type="button" disabled={saving} onClick={() => void onSaveSelected()}>
            {saving ? "Saving…" : "Save selected"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
