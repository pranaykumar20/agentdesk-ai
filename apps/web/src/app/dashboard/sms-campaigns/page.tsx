import { MessageSquareText, Send, Ban, Percent } from "lucide-react";
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
import { getSmsCampaignSummary } from "@/modules/sms-campaigns/data";
import type { SmsCampaignStatus, SmsCampaignType } from "@/modules/sms-campaigns/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "SMS Campaigns" };

function typeLabel(type: SmsCampaignType) {
  const map: Record<SmsCampaignType, string> = {
    appointment: "Appointment",
    promotional: "Promotional",
    reengagement: "Re-engagement",
    transactional: "Transactional",
    informational: "Informational",
  };
  return map[type];
}

function statusVariant(status: SmsCampaignStatus) {
  if (status === "completed") return "success" as const;
  if (status === "scheduled" || status === "sending") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "warning" as const;
}

export default async function SmsCampaignsPage() {
  const { organization } = await requireOrg();
  const { campaigns, metrics, templates } = await getSmsCampaignSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="SMS Campaigns"
        description="Create, manage, and track SMS marketing campaigns."
      />

      <Tabs
        className="mb-6"
        activeId="overview"
        items={[
          { id: "overview", label: "Overview", href: "/dashboard/sms-campaigns" },
          { id: "campaigns", label: "Campaigns", href: "/dashboard/sms-campaigns", count: metrics.totalCampaigns },
          { id: "templates", label: "Templates", href: "/dashboard/sms-campaigns" },
          { id: "analytics", label: "Analytics", href: "/dashboard/sms-campaigns" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Campaigns" value={metrics.totalCampaigns} icon={MessageSquareText} />
        <MetricCard
          label="Messages Sent"
          value={metrics.messagesSent.toLocaleString()}
          icon={Send}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard label="Delivery Rate" value={`${metrics.deliveryRate}%`} icon={Percent} />
        <MetricCard label="Response Rate" value={`${metrics.responseRate}%`} />
        <MetricCard
          label="Opt-Outs"
          value={metrics.optOuts}
          icon={Ban}
          iconClassName="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent campaigns</CardTitle>
          </CardHeader>
          <Table className="min-w-[860px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{typeLabel(campaign.campaignType)}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {campaign.audienceCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {campaign.sentCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <RateBar value={campaign.deliveryRate} />
                  </TableCell>
                  <TableCell>
                    <RateBar value={campaign.responseRate} maxHint={20} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Total subscribers" value="8,243" />
              <Row label="Active" value="7,892" />
              <Row label="Unsubscribed" value="351" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{template.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function RateBar({ value, maxHint = 100 }: { value: number; maxHint?: number }) {
  const width = Math.min(100, (value / maxHint) * 100);
  return (
    <div className="flex min-w-[90px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full bg-primary")} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}%</span>
    </div>
  );
}
