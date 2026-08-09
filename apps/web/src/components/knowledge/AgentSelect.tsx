"use client";

import { Label } from "@/components/ui/label";

export type KnowledgeAgentOption = {
  id: string;
  name: string;
};

export function AgentSelect({
  agents,
  id = "agentId",
  name = "agentId",
  defaultValue = "",
  label = "Assign to",
}: {
  agents: KnowledgeAgentOption[];
  id?: string;
  name?: string;
  defaultValue?: string;
  label?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">All agents</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Shared knowledge is available to every AI employee. Agent-specific items only sync to that
        employee.
      </p>
    </div>
  );
}
