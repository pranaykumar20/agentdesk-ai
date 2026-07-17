import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { VoiceFlowCanvas } from "@/components/voice-flows/VoiceFlowCanvas";
import { getVoiceFlow, getVoicePalette } from "@/modules/voice-flows/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Voice Flow ${id}` };
}

export default async function VoiceFlowDesignerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { organization } = await requireOrg();
  const { id } = await params;
  const flow = await getVoiceFlow(organization.id, id);
  if (!flow) notFound();

  const palette = getVoicePalette();
  const selected = flow.nodes.find((n) => n.kind === "speak") ?? flow.nodes[0];
  const groups = ["Speak", "Listen", "Logic", "Flow"] as const;

  return (
    <div>
      <PageHeader
        title="AI Voice Flow Designer"
        description="Design conversational voice flows for inbound and outbound AI calls."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium"
            >
              Test Flow
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
          href="/dashboard/voice-flows"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All flows
        </Link>
        <p className="text-sm font-semibold text-foreground">{flow.name}</p>
        <Badge variant={flow.status === "published" ? "success" : "warning"}>{flow.status}</Badge>
      </div>

      <Tabs
        className="mb-6"
        activeId="builder"
        items={[
          { id: "builder", label: "Flow Builder", href: `/dashboard/voice-flows/${flow.id}` },
          { id: "intents", label: "Intents", href: `/dashboard/voice-flows/${flow.id}` },
          { id: "entities", label: "Entities", href: `/dashboard/voice-flows/${flow.id}` },
          { id: "settings", label: "Settings", href: `/dashboard/voice-flows/${flow.id}` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Nodes</CardTitle>
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
                      <li key={item.id} className="rounded-lg border border-border px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <VoiceFlowCanvas nodes={flow.nodes} selectedId={selected?.id} />

        <Card>
          <CardHeader>
            <CardTitle>{selected?.title ?? "Node details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Node type</p>
              <p className="font-medium capitalize text-foreground">{selected?.kind ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Message / config</p>
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {selected?.description ?? "Select a node"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Voice</p>
              <p className="font-medium text-foreground">Ava (Friendly)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="font-medium text-foreground">English (US)</p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Demo designer — Retell execution is deferred. Graph JSON can persist to{" "}
              <code>voice_flows</code> / nodes / edges in a later pass.
            </div>
            <button
              type="button"
              disabled
              className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-destructive/30 text-sm font-medium text-destructive opacity-60"
            >
              Delete Node
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
