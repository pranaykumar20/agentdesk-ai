import Link from "next/link";
import { Plus, Workflow } from "lucide-react";
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
import { getWorkflowMetrics, listWorkflows } from "@/modules/workflows/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workflows" };

export default async function WorkflowsPage() {
  const { organization } = await requireOrg();
  const [workflows, metrics] = await Promise.all([
    listWorkflows(organization.id),
    getWorkflowMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Workflow Builder"
        description="Automate tasks and connect your apps with AI workflows."
        actions={
          <Link
            href={`/dashboard/workflows/${workflows[0]?.id ?? "wf-1"}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Open Builder
          </Link>
        }
      />

      <Tabs
        className="mb-6"
        activeId="workflows"
        items={[
          { id: "workflows", label: "Workflows", href: "/dashboard/workflows", count: metrics.total },
          { id: "runs", label: "Runs", href: "/dashboard/workflows" },
          { id: "templates", label: "Templates", href: "/dashboard/workflows" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Workflows" value={metrics.total} icon={Workflow} />
        <MetricCard label="Published" value={metrics.published} />
        <MetricCard label="Drafts" value={metrics.draft} />
        <MetricCard label="Total Runs" value={metrics.runs.toLocaleString()} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Runs</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground">{workflow.description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={workflow.status === "published" ? "success" : "warning"}>
                    {workflow.status}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {workflow.runs.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(workflow.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/workflows/${workflow.id}`}
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
