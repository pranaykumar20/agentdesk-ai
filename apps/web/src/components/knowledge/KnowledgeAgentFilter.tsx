"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import type { KnowledgeAgentOption } from "./AgentSelect";

export function KnowledgeAgentFilter({ agents }: { agents: KnowledgeAgentOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("agent") ?? "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="kb-agent-filter" className="text-sm text-muted-foreground">
        Show
      </Label>
      <select
        id="kb-agent-filter"
        className="flex h-9 rounded-lg border border-input bg-background px-3 text-sm"
        value={current}
        onChange={(e) => {
          const value = e.target.value;
          const params = new URLSearchParams(searchParams.toString());
          if (!value || value === "all") params.delete("agent");
          else params.set("agent", value);
          const qs = params.toString();
          router.push(qs ? `/dashboard/knowledge-base?${qs}` : "/dashboard/knowledge-base");
        }}
      >
        <option value="all">All knowledge</option>
        <option value="shared">Shared only</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}
