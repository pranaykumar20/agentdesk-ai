import Link from "next/link";
import { MessageSquare, Play } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CallStatusBadge, DispositionBadge } from "@/components/dashboard/StatusBadge";
import { Pagination } from "@/components/dashboard/Pagination";
import { listCalls } from "@/modules/calls/data";
import { formatDateTime, formatDuration, initials } from "@/lib/formatting/datetime";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calls" };

const TABS = [
  { id: "all", label: "All Calls" },
  { id: "answered", label: "Answered" },
  { id: "missed", label: "Missed" },
  { id: "voicemails", label: "Voicemails" },
] as const;

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; disposition?: string; page?: string }>;
}) {
  const { organization } = await requireOrg();
  const params = await searchParams;
  const tab = (params.tab as "all" | "answered" | "missed" | "voicemails" | undefined) ?? "all";
  const page = Number(params.page ?? "1") || 1;
  const q = params.q ?? "";
  const disposition = params.disposition ?? "all";

  const [result, answered, missed, voicemails, all] = await Promise.all([
    listCalls(organization.id, { tab, q, disposition, page, pageSize: 10 }),
    listCalls(organization.id, { tab: "answered", page: 1, pageSize: 1 }),
    listCalls(organization.id, { tab: "missed", page: 1, pageSize: 1 }),
    listCalls(organization.id, { tab: "voicemails", page: 1, pageSize: 1 }),
    listCalls(organization.id, { tab: "all", page: 1, pageSize: 1 }),
  ]);

  function tabHref(id: string) {
    const sp = new URLSearchParams();
    if (id !== "all") sp.set("tab", id);
    if (q) sp.set("q", q);
    if (disposition !== "all") sp.set("disposition", disposition);
    const qs = sp.toString();
    return qs ? `/dashboard/calls?${qs}` : "/dashboard/calls";
  }

  return (
    <div>
      <PageHeader
        title="Calls"
        description="Server-paginated call history with filters."
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={tabHref(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              tab === t.id ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Calls" value={all.total.toLocaleString()} hint="All statuses" />
        <MetricCard label="Answered" value={answered.total.toLocaleString()} hint="Completed conversations" />
        <MetricCard label="Voicemails" value={voicemails.total.toLocaleString()} hint="Left a message" />
        <MetricCard label="Missed" value={missed.total.toLocaleString()} hint="No answer / missed" />
      </div>

      <form className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row" method="get">
        {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
        <label className="sr-only" htmlFor="q">
          Search calls
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search by name, number or keyword..."
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <label className="sr-only" htmlFor="disposition">
          Disposition
        </label>
        <select
          id="disposition"
          name="disposition"
          defaultValue={disposition}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Dispositions</option>
          <option value="Book Appointment">Book Appointment</option>
          <option value="Office Hours">Office Hours</option>
          <option value="Insurance Inquiry">Insurance Inquiry</option>
          <option value="Pricing & Costs">Pricing & Costs</option>
          <option value="General Inquiry">General Inquiry</option>
        </select>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Caller</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Agent / Number</th>
                <th className="px-3 py-3 font-medium">Duration</th>
                <th className="px-3 py-3 font-medium">Disposition</th>
                <th className="px-3 py-3 font-medium">Date & time</th>
                <th className="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((call) => (
                <tr key={call.id} className="border-b border-border/70 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {initials(call.callerName)}
                      </span>
                      <div>
                        <Link href={`/dashboard/calls/${call.id}`} className="font-medium text-foreground hover:text-primary">
                          {call.callerName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{call.callerPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <CallStatusBadge status={call.status} />
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-foreground">{call.agentName}</p>
                    <p className="text-xs text-muted-foreground">{call.phoneNumber}</p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDuration(call.durationSeconds)}</td>
                  <td className="px-3 py-3">
                    <DispositionBadge disposition={call.disposition} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(call.startedAt, organization.timezone)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/calls/${call.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Play recording for ${call.callerName}`}
                      >
                        <Play className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/calls/${call.id}?tab=transcript`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`View transcript for ${call.callerName}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          basePath="/dashboard/calls"
          searchParams={{ tab: tab === "all" ? undefined : tab, q: q || undefined, disposition: disposition === "all" ? undefined : disposition }}
        />
      </div>
    </div>
  );
}
