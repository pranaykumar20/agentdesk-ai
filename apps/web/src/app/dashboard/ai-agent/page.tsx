import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { AgentEditor } from "@/components/ai-agent/AgentEditor";
import { getAiAgent } from "@/modules/agents/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Agent" };

export default async function AiAgentPage() {
  const { organization } = await requireOrg();
  const agent = await getAiAgent(organization.id);

  return (
    <div>
      <PageHeader
        title="AI Agent"
        description="Configure draft behavior and publish versions deliberately — live agent is never silently overwritten."
        actions={<Badge variant="success">{agent.status}</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Model" value={agent.model} hint="Current runtime model" />
        <MetricCard label="Confidence" value={`${agent.confidenceThreshold}%`} hint="Escalation threshold" />
        <MetricCard label="Language" value={agent.language} />
        <MetricCard label="Voice" value={agent.voice} />
        <MetricCard
          label="Published"
          value={agent.published ? `v${agent.published.versionNumber}` : "—"}
          hint="Live version"
        />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">{agent.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{agent.roleTitle}</p>
        <p className="mt-3 text-sm text-foreground">{agent.description}</p>
      </div>

      <AgentEditor agent={agent} />
    </div>
  );
}
