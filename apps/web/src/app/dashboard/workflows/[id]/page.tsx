import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { WorkflowCanvas } from "@/components/workflows/WorkflowCanvas";
import { getWorkflow, getWorkflowPalette } from "@/modules/workflows/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Workflow ${id}` };
}

export default async function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { organization } = await requireOrg();
  const { id } = await params;
  const workflow = await getWorkflow(organization.id, id);
  if (!workflow) notFound();

  const palette = getWorkflowPalette();
  const selected = workflow.graph.nodes[0];
  const groups = ["Triggers", "Actions", "Conditions"] as const;

  return (
    <div>
      <PageHeader
        title="Workflow Builder"
        description="Automate tasks and connect your apps with AI workflows."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium"
            >
              Test Workflow
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium"
            >
              Save
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Publish
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/workflows"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All workflows
        </Link>
        <p className="text-sm font-semibold text-foreground">{workflow.name}</p>
        <Badge variant={workflow.status === "published" ? "success" : "warning"}>
          {workflow.status}
        </Badge>
      </div>

      <Tabs
        className="mb-6"
        activeId="builder"
        items={[
          { id: "builder", label: "Builder", href: `/dashboard/workflows/${workflow.id}` },
          { id: "runs", label: "Runs", href: `/dashboard/workflows/${workflow.id}` },
          { id: "analytics", label: "Analytics", href: `/dashboard/workflows/${workflow.id}` },
          { id: "settings", label: "Settings", href: `/dashboard/workflows/${workflow.id}` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-2">
                  {palette
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-border px-3 py-2"
                      >
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <WorkflowCanvas nodes={workflow.graph.nodes} selectedId={selected?.id} />

        <Card>
          <CardHeader>
            <CardTitle>{selected?.title ?? "Step details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Step ID</p>
              <p className="font-medium text-foreground">{selected?.id ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize text-foreground">{selected?.kind ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-muted-foreground">{selected?.description ?? "Select a step"}</p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Demo builder — drag/drop and live execution are stubbed. Save/Publish write to the
              in-memory graph until Supabase persistence is wired.
            </div>
            <button
              type="button"
              disabled
              className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-destructive/30 text-sm font-medium text-destructive opacity-60"
            >
              Delete Step
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
