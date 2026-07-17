import Link from "next/link";
import { Plus, AudioLines } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVoiceFlowMetrics, listVoiceFlows } from "@/modules/voice-flows/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Voice Flows" };

export default async function VoiceFlowsPage() {
  const { organization } = await requireOrg();
  const [flows, metrics] = await Promise.all([
    listVoiceFlows(organization.id),
    getVoiceFlowMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="AI Voice Flow Designer"
        description="Design conversational voice flows for inbound and outbound AI calls."
        actions={
          <Link
            href={`/dashboard/voice-flows/${flows[0]?.id ?? "vf-1"}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Open Designer
          </Link>
        }
      />

      <Tabs
        className="mb-6"
        activeId="flows"
        items={[
          { id: "flows", label: "Voice Flows", href: "/dashboard/voice-flows", count: metrics.total },
          { id: "intents", label: "Intents", href: "/dashboard/voice-flows" },
          { id: "templates", label: "Templates", href: "/dashboard/voice-flows" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Flows" value={metrics.total} icon={AudioLines} />
        <MetricCard label="Published" value={metrics.published} />
        <MetricCard label="Drafts" value={metrics.draft} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead>Flow</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{flow.name}</p>
                  <p className="text-xs text-muted-foreground">{flow.description}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{flow.agentName}</TableCell>
                <TableCell>
                  <Badge variant={flow.status === "published" ? "success" : "warning"}>
                    {flow.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(flow.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/voice-flows/${flow.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
