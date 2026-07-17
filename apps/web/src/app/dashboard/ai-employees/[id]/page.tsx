import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { AgentEditor } from "@/components/ai-agent/AgentEditor";
import { getAiEmployeeById } from "@/modules/agents/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Employee" };

export default async function AiEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { organization } = await requireOrg();
  const { id } = await params;
  const agent = await getAiEmployeeById(organization.id, id);
  if (!agent) notFound();

  return (
    <div>
      <PageHeader
        title={agent.name}
        description={agent.description || "Configure draft behavior and publish versions deliberately."}
        actions={<Badge variant={agent.lifecycleStatus === "published" ? "success" : "warning"}>{agent.lifecycleStatus}</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Role" value={agent.roleTitle} />
        <MetricCard label="Department" value={agent.department} />
        <MetricCard label="Model" value={agent.model} />
        <MetricCard label="Voice" value={agent.voice} />
        <MetricCard
          label="Published"
          value={agent.published ? `v${agent.published.versionNumber}` : "—"}
          hint="Live version"
        />
      </div>

      <AgentEditor agent={agent} />
    </div>
  );
}
