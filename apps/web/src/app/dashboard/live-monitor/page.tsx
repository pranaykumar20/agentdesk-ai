import { Ear, PhoneCall, Radio, UserCheck } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getLiveMonitorSummary } from "@/modules/live-monitor/data";
import type { LiveCallStatus } from "@/modules/live-monitor/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Call Monitor" };

function statusVariant(status: LiveCallStatus) {
  if (status === "ringing") return "warning" as const;
  if (status === "on_hold") return "secondary" as const;
  if (status === "transferring") return "default" as const;
  return "success" as const;
}

function sentimentTone(sentiment: "positive" | "neutral" | "negative") {
  if (sentiment === "positive") return "text-success";
  if (sentiment === "negative") return "text-destructive";
  return "text-muted-foreground";
}

export default async function LiveMonitorPage() {
  const { organization } = await requireOrg();
  const { calls, metrics } = await getLiveMonitorSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="Live Call Monitor"
        description="Watch active calls in real time. Listen, whisper, and barge actions are stubbed until telephony hooks are live."
      />

      <Tabs
        className="mb-6"
        activeId="live"
        items={[
          { id: "live", label: "Live Calls", href: "/dashboard/live-monitor", count: calls.length },
          { id: "agents", label: "Agents", href: "/dashboard/live-monitor" },
          { id: "queues", label: "Queues", href: "/dashboard/call-queues" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Calls" value={metrics.activeCalls} icon={PhoneCall} />
        <MetricCard
          label="Ringing"
          value={metrics.ringing}
          icon={Radio}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Agents Available"
          value={metrics.agentsAvailable}
          icon={UserCheck}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard label="Avg. Handle Time" value={metrics.avgHandleLabel} icon={Ear} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {calls.map((call) => (
          <Card key={call.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{call.callerName}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{call.callerPhone}</p>
                </div>
                <Badge variant={statusVariant(call.status)}>
                  {call.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Agent</p>
                  <p className="font-medium text-foreground">{call.agentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Queue</p>
                  <p className="font-medium text-foreground">{call.queueName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium tabular-nums text-foreground">{call.durationLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sentiment</p>
                  <p className={cn("font-medium capitalize", sentimentTone(call.sentiment))}>
                    {call.sentiment}
                  </p>
                </div>
              </div>
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {call.topic}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground opacity-70"
                  title="Provider hook stubbed"
                >
                  Listen
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground opacity-70"
                  title="Provider hook stubbed"
                >
                  Whisper
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground opacity-70"
                  title="Provider hook stubbed"
                >
                  Barge
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
