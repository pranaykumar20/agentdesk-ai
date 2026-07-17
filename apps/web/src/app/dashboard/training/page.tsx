import { GraduationCap, Database, MessagesSquare, Target } from "lucide-react";
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
import { getTrainingSummary } from "@/modules/training/data";
import type { TrainingJobStatus } from "@/modules/training/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Training Center" };

function statusVariant(status: TrainingJobStatus) {
  if (status === "completed") return "success" as const;
  if (status === "running") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "warning" as const;
}

export default async function TrainingPage() {
  const { organization } = await requireOrg();
  const { jobs, metrics, topTrainings } = await getTrainingSummary(organization.id);

  return (
    <div>
      <PageHeader
        title="AI Training Center"
        description="Train your AI agents with knowledge, conversations, and custom datasets."
      />

      <Tabs
        className="mb-6"
        activeId="overview"
        items={[
          { id: "overview", label: "Overview", href: "/dashboard/training" },
          { id: "trainings", label: "Trainings", href: "/dashboard/training", count: metrics.totalTrainings },
          { id: "datasets", label: "Datasets", href: "/dashboard/training", count: metrics.datasets },
          { id: "evaluations", label: "Evaluations", href: "/dashboard/training" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Trainings" value={metrics.totalTrainings} icon={GraduationCap} />
        <MetricCard label="Datasets" value={metrics.datasets} icon={Database} />
        <MetricCard
          label="Conversations Analyzed"
          value={metrics.conversationsAnalyzed.toLocaleString()}
          icon={MessagesSquare}
        />
        <MetricCard label="Model Accuracy" value={`${metrics.modelAccuracy}%`} icon={Target} />
        <MetricCard label="Evaluations Passed" value={metrics.evaluationsPassed} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent trainings</CardTitle>
          </CardHeader>
          <Table className="min-w-[860px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Training</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium text-foreground">{job.name}</TableCell>
                  <TableCell className="text-muted-foreground">{job.agentName}</TableCell>
                  <TableCell className="text-muted-foreground">{job.datasetName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[100px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            job.accuracy >= 90 ? "bg-success" : "bg-warning",
                          )}
                          style={{ width: `${job.accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {job.accuracy}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avg. accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {metrics.modelAccuracy}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Across scored trainings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top performing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topTrainings.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">{item.accuracy}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
