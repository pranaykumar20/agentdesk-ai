import { Store, Star } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { listMarketplaceAgents } from "@/modules/marketplace/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agent Marketplace" };

export default async function MarketplacePage() {
  await requireOrg();
  const agents = await listMarketplaceAgents();

  return (
    <div>
      <PageHeader
        title="Agent Marketplace"
        description="Browse and install prebuilt AI employees for your industry."
      />

      <Tabs
        className="mb-6"
        activeId="browse"
        items={[
          { id: "browse", label: "Browse", href: "/dashboard/marketplace", count: agents.length },
          { id: "installed", label: "Installed", href: "/dashboard/marketplace" },
          { id: "reviews", label: "Reviews", href: "/dashboard/marketplace" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Available Agents" value={agents.length} icon={Store} />
        <MetricCard
          label="Avg. Rating"
          value={(agents.reduce((s, a) => s + a.rating, 0) / agents.length).toFixed(1)}
          icon={Star}
        />
        <MetricCard
          label="Total Installs"
          value={agents.reduce((s, a) => s + a.installs, 0).toLocaleString()}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <Badge variant="secondary">{agent.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{agent.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ★ {agent.rating} · {agent.installs.toLocaleString()} installs
                </span>
                <span className="font-semibold text-foreground">{agent.priceLabel}</span>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Install
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
