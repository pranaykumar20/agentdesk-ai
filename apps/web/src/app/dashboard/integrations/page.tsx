import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { IntegrationActions } from "@/components/integrations/IntegrationActions";
import { getIntegrationMetrics, listIntegrations } from "@/modules/integrations/data";
import { formatDateTime } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations" };

function statusDot(status: string) {
  if (status === "connected") return "bg-success";
  if (status === "needs_attention" || status === "error") return "bg-warning";
  return "bg-destructive";
}

export default async function IntegrationsPage() {
  const { organization } = await requireOrg();
  const [items, metrics] = await Promise.all([
    listIntegrations(organization.id),
    getIntegrationMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools and services. Secrets never leave the server."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Integrations" value={metrics.total} />
        <MetricCard label="Connected" value={metrics.connected} />
        <MetricCard label="Needs Attention" value={metrics.needsAttention} />
        <MetricCard label="Disconnected" value={metrics.disconnected} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Integration</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Connected On</th>
                <th className="px-3 py-3 font-medium">Last Sync</th>
                <th className="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="default">{item.category}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span className={`h-2 w-2 rounded-full ${statusDot(item.status)}`} />
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.connectedOn
                      ? formatDateTime(item.connectedOn, organization.timezone)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.lastSync
                      ? formatDateTime(item.lastSync, organization.timezone)
                      : "Never"}
                  </td>
                  <td className="px-3 py-3">
                    <IntegrationActions id={item.id} status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
