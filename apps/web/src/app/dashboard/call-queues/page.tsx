import { Clock, ListOrdered, PhoneMissed, Timer } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCallQueueSummary } from "@/modules/call-queues/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Call Queues" };

export default async function CallQueuesPage() {
  const { organization } = await requireOrg();
  const { queues, metrics } = await getCallQueueSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="Call Queue Management"
        description="Manage call queues, routing, wait times, and agent distribution."
      />

      <Tabs
        className="mb-6"
        activeId="overview"
        items={[
          { id: "overview", label: "Overview", href: "/dashboard/call-queues" },
          { id: "queues", label: "Queues", href: "/dashboard/call-queues", count: metrics.totalQueues },
          { id: "members", label: "Queue Members", href: "/dashboard/call-queues" },
          { id: "routing", label: "Routing Rules", href: "/dashboard/routing-rules" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Queues" value={metrics.totalQueues} hint="Active queues" icon={ListOrdered} />
        <MetricCard label="Calls in Queues" value={metrics.callsInQueues} icon={Timer} />
        <MetricCard
          label="Avg. Wait Time"
          value={metrics.avgWaitLabel}
          icon={Clock}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Longest Wait"
          value={metrics.longestWaitLabel}
          hint={`In ${metrics.longestWaitQueue}`}
        />
        <MetricCard
          label="Abandoned Calls"
          value={metrics.abandoned}
          icon={PhoneMissed}
          iconClassName="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Queue</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>In queue</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Avg wait</TableHead>
                <TableHead>Longest</TableHead>
                <TableHead>Abandoned</TableHead>
                <TableHead>Service level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((queue) => (
                <TableRow key={queue.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", queue.color)} />
                      <span className="font-medium text-foreground">{queue.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{queue.queueType}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {queue.callsInQueue}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {queue.agentsOnline} / {queue.agentsTotal}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {queue.avgWaitLabel}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {queue.longestWaitLabel}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {queue.abandoned} ({queue.abandonedRate}%)
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[100px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            queue.serviceLevel >= 85 ? "bg-success" : "bg-warning",
                          )}
                          style={{ width: `${queue.serviceLevel}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {queue.serviceLevel}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={queue.status === "active" ? "success" : "secondary"}>
                      {queue.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {queues
                .filter((q) => q.status === "active")
                .map((q) => (
                  <div key={q.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={cn("h-2 w-2 rounded-full", q.color)} />
                      {q.name}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">{q.callsInQueue}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Service level goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">86%</p>
              <p className="mt-1 text-sm text-muted-foreground">Goal: 80% · 6% above goal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Create New Queue</p>
              <p className="text-muted-foreground">Manage Queue Members</p>
              <p className="text-muted-foreground">Set Routing Rules</p>
              <p className="text-muted-foreground">Configure Business Hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
