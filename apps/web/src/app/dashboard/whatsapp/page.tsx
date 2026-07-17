import { MessageCircle, Send, Eye, Reply } from "lucide-react";
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
import { getWhatsappSummary } from "@/modules/whatsapp/data";
import type { WhatsappMessageStatus } from "@/modules/whatsapp/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "WhatsApp Automation" };

function statusVariant(status: WhatsappMessageStatus) {
  if (status === "replied" || status === "read") return "success" as const;
  if (status === "failed") return "destructive" as const;
  if (status === "pending") return "warning" as const;
  return "default" as const;
}

export default async function WhatsappPage() {
  const { organization } = await requireOrg();
  const { conversations, metrics, workflows } = await getWhatsappSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="WhatsApp Automation"
        description="Automate WhatsApp conversations, broadcasts, and support workflows."
      />

      <Tabs
        className="mb-6"
        activeId="overview"
        items={[
          { id: "overview", label: "Overview", href: "/dashboard/whatsapp" },
          { id: "workflows", label: "Workflows", href: "/dashboard/whatsapp" },
          { id: "templates", label: "Templates", href: "/dashboard/whatsapp" },
          { id: "broadcasts", label: "Broadcasts", href: "/dashboard/whatsapp" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Messages Sent"
          value={metrics.messagesSent.toLocaleString()}
          icon={Send}
        />
        <MetricCard
          label="Delivered"
          value={metrics.messagesDelivered.toLocaleString()}
          icon={MessageCircle}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard label="Read Rate" value={`${metrics.readRate}%`} icon={Eye} />
        <MetricCard
          label="Response Rate"
          value={`${metrics.responseRate}%`}
          icon={Reply}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <MetricCard label="Active Workflows" value={metrics.activeWorkflows} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent WhatsApp conversations</CardTitle>
          </CardHeader>
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Last message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{row.contactName}</p>
                    <p className="text-xs text-muted-foreground">{row.interest}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.workflowName}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                    {row.lastMessage}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
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
              <CardTitle>Account status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Business number</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quality rating</span>
                <span className="font-medium text-foreground">High</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Daily limit</span>
                <span className="tabular-nums text-foreground">1,000 / 1,000</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top workflows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflows.map((wf) => (
                <div key={wf.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{wf.name}</span>
                    <span className="tabular-nums text-foreground">{wf.volume}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full bg-primary")}
                      style={{ width: `${wf.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
