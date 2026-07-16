import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Phone, Play } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { getCallDetail } from "@/modules/calls/data";
import { CallDetailTabs } from "@/components/calls/CallDetailTabs";
import { Badge } from "@/components/ui/badge";
import { CallStatusBadge, DispositionBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime, formatDuration, initials } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Call ${id}` };
}

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrg();
  const { id } = await params;
  const call = await getCallDetail(organization.id, id);
  if (!call) notFound();

  return (
    <div>
      <Link
        href="/dashboard/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to calls
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-primary">
              {initials(call.callerName)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{call.callerName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{call.callerPhone}</p>
              {call.callerEmail ? <p className="text-sm text-muted-foreground">{call.callerEmail}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <CallStatusBadge status={call.status} />
                <Badge variant="default">{call.agentName}</Badge>
                {call.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDateTime(call.startedAt, organization.timezone)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden />
              {formatDuration(call.durationSeconds)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" aria-hidden />
              {call.phoneNumber}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <DispositionBadge disposition={call.disposition} />
          <Badge variant="outline">Inbound Call</Badge>
          <button
            type="button"
            disabled={!call.recordingAvailable}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary px-3 text-sm font-medium text-primary disabled:opacity-40"
          >
            <Play className="h-4 w-4" aria-hidden />
            {call.recordingAvailable ? "Play Recording" : "No recording"}
          </button>
          {call.recordingAvailable ? (
            <span className="text-xs text-muted-foreground">Consent captured · secure playback</span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CallDetailTabs call={call} />
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Key topics</h2>
            <ul className="mt-3 space-y-2">
              {call.keyTopics.map((topic) => (
                <li key={topic.topic}>
                  <div className="flex justify-between text-sm">
                    <span>{topic.topic}</span>
                    <span className="text-muted-foreground">{topic.weight}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${topic.weight}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Sentiment</h2>
            <p className="mt-2 text-sm text-success">
              {call.sentiment === "positive" ? "Positive" : call.sentiment ?? "Unknown"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The caller was satisfied with the interaction.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">AI insights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {call.insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
