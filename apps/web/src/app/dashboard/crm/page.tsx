import { Contact } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "CRM & Pipeline" };

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function CrmPage() {
  const { organization } = await requireOrg();
  const summary = await getCrmPipelineSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="CRM & Lead Pipeline"
        description="Track leads, deals, and revenue across your pipeline."
      />

      <Tabs
        className="mb-6"
        activeId="pipeline"
        items={[
          { id: "pipeline", label: "Pipeline", href: "/dashboard/crm" },
          { id: "leads", label: "Leads", href: "/dashboard/crm" },
          { id: "deals", label: "Deals", href: "/dashboard/crm" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Deals" value={summary.totalDeals} icon={Contact} />
        <MetricCard label="Pipeline Value" value={formatMoney(summary.totalValueCents)} />
        <MetricCard
          label="Won"
          value={summary.byStage.find((s) => s.id === "won")?.count ?? 0}
          hint={formatMoney(summary.byStage.find((s) => s.id === "won")?.valueCents ?? 0)}
        />
        <MetricCard label="Open Tasks" value={summary.tasks.length} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {summary.byStage.map((column) => (
            <div
              key={column.id}
              className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", column.tone)} />
                  <p className="text-sm font-semibold text-foreground">{column.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {column.count} · {formatMoney(column.valueCents)}
                </p>
              </div>
              <ul className="flex-1 space-y-2 p-2">
                {column.items.map((deal) => (
                  <li
                    key={deal.id}
                    className="rounded-lg border border-border bg-background px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-foreground">{deal.contactName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{deal.interest}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge variant="secondary">{deal.source}</Badge>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {formatMoney(deal.valueCents)}
                      </span>
                    </div>
                  </li>
                ))}
                {column.items.length === 0 ? (
                  <li className="px-2 py-6 text-center text-xs text-muted-foreground">No deals</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.sources.map((source) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{source.source}</span>
                  <span className="font-medium tabular-nums text-foreground">{source.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks due</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      task.urgency === "today"
                        ? "text-destructive"
                        : task.urgency === "tomorrow"
                          ? "text-warning"
                          : "text-muted-foreground",
                    )}
                  >
                    {task.dueLabel}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
