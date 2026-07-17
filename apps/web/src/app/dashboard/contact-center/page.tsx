import { Inbox, MessageSquare, Phone, Star } from "lucide-react";
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
import { getContactCenterSummary } from "@/modules/contact-center/data";
import { CHANNEL_TABS, type ConversationStatus } from "@/modules/contact-center/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Center" };

function statusVariant(status: ConversationStatus) {
  if (status === "resolved") return "success" as const;
  if (status === "pending" || status === "on_hold") return "warning" as const;
  return "default" as const;
}

function channelLabel(channel: string) {
  return CHANNEL_TABS.find((t) => t.id === channel)?.label ?? channel;
}

export default async function ContactCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { organization } = await requireOrg();
  const params = await searchParams;
  const channelParam = params.channel ?? "all";
  const activeChannel =
    CHANNEL_TABS.find((t) => t.id === channelParam)?.id ?? "all";

  const summary = await getContactCenterSummary(organization.id);
  const conversations =
    activeChannel === "all"
      ? summary.conversations
      : summary.conversations.filter((c) => c.channel === activeChannel);

  return (
    <div>
      <PageHeader
        title="Customer Contact Center"
        description="Manage all customer conversations across channels in one unified inbox."
        actions={
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />
            Available
          </span>
        }
      />

      <Tabs
        className="mb-6"
        activeId={activeChannel}
        items={CHANNEL_TABS.map((tab) => ({
          id: tab.id,
          label: tab.label,
          href:
            tab.id === "all"
              ? "/dashboard/contact-center"
              : `/dashboard/contact-center?channel=${tab.id}`,
        }))}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Open Conversations" value={summary.metrics.open} icon={Inbox} />
        <MetricCard
          label="New Today"
          value={summary.metrics.newToday}
          icon={MessageSquare}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="SLA Compliance"
          value={`${summary.metrics.slaCompliance}%`}
          icon={Phone}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard label="Resolutions Today" value={summary.metrics.resolutionsToday} />
        <MetricCard
          label="CSAT Score"
          value={`${summary.metrics.csat}/5`}
          icon={Star}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <Table className="min-w-[840px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Contact</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Subject / Last message</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{row.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.contactPhone ?? row.contactEmail ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{channelLabel(row.channel)}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{row.subject}</p>
                    <p className="text-xs text-muted-foreground">{row.lastMessage}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.queueName}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.assigneeName}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>
                      {row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.relativeTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <StatRow
                label="Agents online"
                value={`${summary.metrics.agentsOnline}/${summary.metrics.agentsTotal}`}
                pct={(summary.metrics.agentsOnline / summary.metrics.agentsTotal) * 100}
                tone="bg-emerald-500"
              />
              <StatRow
                label="Calls in queue"
                value={String(summary.metrics.callsInQueue)}
                pct={Math.min(100, summary.metrics.callsInQueue * 12)}
                tone="bg-primary"
              />
              <StatRow
                label="Avg. response"
                value={summary.metrics.avgResponseLabel}
                pct={70}
                tone="bg-sky-500"
              />
              <StatRow
                label="Longest wait"
                value={summary.metrics.longestWaitLabel}
                pct={45}
                tone="bg-amber-500"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queue overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.queues.map((q) => (
                <div key={q.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{q.name}</span>
                  <span className="font-medium tabular-nums text-foreground">{q.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top agents today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topAgents.map((agent, idx) => (
                <div key={agent.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {idx + 1}. {agent.name}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">
                    {agent.resolutions}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
