"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgentSelect, type KnowledgeAgentOption } from "./AgentSelect";

export function CreateFaqForm({ agents }: { agents: KnowledgeAgentOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [brief, setBrief] = useState("");

  async function onSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "faq",
          requirements: brief || question || answer,
          question: question || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        faq?: { question: string; answer: string; category: string };
      };
      if (!res.ok || !data.faq) {
        setError(data.error ?? "AI suggestion failed");
        return;
      }
      setQuestion(data.faq.question);
      setAnswer(data.faq.answer);
      setCategory(data.faq.category || "General");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestion failed");
    } finally {
      setSuggesting(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const agentRaw = String(form.get("agentId") ?? "").trim();
    const agentId = agentRaw || null;

    try {
      const res = await fetch("/api/knowledge/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim() || "General",
          agentId,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        sync?: { synced?: number; errors?: string[] };
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to create FAQ");
        return;
      }
      if (data.sync?.errors?.length) {
        setError(
          `FAQ saved, but agent sync had issues: ${data.sync.errors.join("; ")}`,
        );
      } else {
        setOpen(false);
        setQuestion("");
        setAnswer("");
        setCategory("General");
        setBrief("");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create FAQ");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add FAQ
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3 rounded-lg border border-border p-3">
      <div className="space-y-1">
        <Label htmlFor="faq-brief">Notes for AI (optional)</Label>
        <Textarea
          id="faq-brief"
          rows={2}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. We close Mondays; lunch buffet Sat–Sun noon–3"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={suggesting || (!brief.trim() && !question.trim())}
          onClick={() => void onSuggest()}
        >
          {suggesting ? "Suggesting…" : "Suggest with AI"}
        </Button>
      </div>
      <div className="space-y-1">
        <Label htmlFor="faq-question">Question</Label>
        <Input
          id="faq-question"
          name="question"
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="faq-answer">Answer</Label>
        <Textarea
          id="faq-answer"
          name="answer"
          rows={3}
          required
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="faq-category">Category</Label>
        <Input
          id="faq-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <AgentSelect agents={agents} id="faq-agentId" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save FAQ"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
