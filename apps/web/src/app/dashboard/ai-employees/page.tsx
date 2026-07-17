import Link from "next/link";
import { Bot, Plus } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
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
import { getAiEmployeeMetrics, listAiEmployees } from "@/modules/agents/data";
import type { EmployeeLifecycleStatus } from "@/modules/agents/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Employees" };

function statusVariant(status: EmployeeLifecycleStatus) {
  if (status === "published") return "success" as const;
  if (status === "draft") return "warning" as const;
  return "secondary" as const;
}

export default async function AiEmployeesPage() {
  const { organization } = await requireOrg();
  const [employees, metrics] = await Promise.all([
    listAiEmployees(organization.id),
    getAiEmployeeMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="AI Employees"
        description="Build, train, and deploy unlimited AI employees for your business."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/settings"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              Training Settings
            </Link>
            <Link
              href="/dashboard/ai-employees/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New AI Employee
            </Link>
          </div>
        }
      />

      <Tabs
        className="mb-6"
        activeId="employees"
        items={[
          { id: "employees", label: "AI Employees", href: "/dashboard/ai-employees", count: metrics.total },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Employees" value={metrics.total} icon={Bot} />
        <MetricCard label="Published" value={metrics.published} hint="Live in production" />
        <MetricCard label="Drafts" value={metrics.draft} hint="Not published yet" />
        <MetricCard
          label="Avg. Performance"
          value={`${metrics.avgAccuracy}%`}
          hint="Across scored employees"
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No AI employees yet"
              description="Create your first AI receptionist, sales rep, or support agent."
              icon={<Bot className="h-5 w-5" />}
              action={
                <Link
                  href="/dashboard/ai-employees/new"
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Create AI Employee
                </Link>
              }
            />
          </div>
        ) : (
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Voice / Language</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/ai-employees/${employee.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {employee.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{employee.roleTitle}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{employee.department}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.voice} · {employee.language}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {employee.performanceScore != null ? `${employee.performanceScore}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(employee.lifecycleStatus)}>
                      {employee.lifecycleStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.publishedVersion != null ? `v${employee.publishedVersion}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
