"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Copy, Pause, Play } from "lucide-react";
import type { RoutingRule } from "@/modules/routing/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoutingRulesBoard({ initialRules }: { initialRules: RoutingRule[] }) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function persistOrder(next: RoutingRule[]) {
    setRules(next);
    startTransition(async () => {
      await fetch("/api/routing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((r) => r.id) }),
      });
      router.refresh();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rules.length) return;
    const next = [...rules];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    persistOrder(next);
  }

  async function createRule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/routing-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = (await res.json()) as { error?: string; rule?: RoutingRule };
    if (!res.ok || !data.rule) {
      setError(data.error ?? "Failed to create rule");
      return;
    }
    setName("");
    setDescription("");
    setRules((prev) => [data.rule!, ...prev]);
    router.refresh();
  }

  function patchRule(id: string, body: Record<string, string>) {
    startTransition(async () => {
      const res = await fetch(`/api/routing-rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { rule?: RoutingRule };
      if (data.rule) {
        if (body.action === "duplicate") {
          setRules((prev) => [data.rule!, ...prev]);
        } else {
          setRules((prev) => prev.map((r) => (r.id === id ? data.rule! : r)));
        }
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createRule} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
        <div className="space-y-1 md:col-span-1">
          <Label htmlFor="rule-name">Rule name</Label>
          <Input id="rule-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1 md:col-span-1">
          <Label htmlFor="rule-desc">Description</Label>
          <Input id="rule-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            Create rule
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-3">{error}</p> : null}
      </form>

      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={rule.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{rule.name}</h3>
                  <Badge variant={rule.status === "active" ? "success" : "secondary"}>{rule.status}</Badge>
                  <span className="text-xs text-muted-foreground">Priority {rule.priority}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  WHEN {rule.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  THEN {rule.actions.map((a) => a.actionType).join(", ")} · fallback {rule.fallback}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button type="button" size="sm" variant="outline" disabled={pending || index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending || index === rules.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    patchRule(rule.id, {
                      status: rule.status === "active" ? "paused" : "active",
                    })
                  }
                >
                  {rule.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => patchRule(rule.id, { action: "duplicate" })}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
