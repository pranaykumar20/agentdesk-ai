import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getLeadMetrics, listLeads } from "@/modules/leads/data";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const ctx = await requirePermission("read", "leads");
  const [leads, metrics] = await Promise.all([
    listLeads(ctx.organization.id),
    getLeadMetrics(ctx.organization.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Callers captured by your AI receptionist — follow up from here.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total" value={metrics.total} />
        <MetricCard label="New" value={metrics.newCount} />
        <MetricCard label="Callbacks" value={metrics.callbackCount} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No leads yet. When your AI answers a call, outcomes appear here.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{lead.contactName}</div>
                    <div className="text-xs text-muted-foreground">{lead.contactPhone ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{lead.status}</td>
                  <td className="px-4 py-3">{lead.source ?? "—"}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {lead.notes ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Looking for the full pipeline?{" "}
        <Link href="/dashboard/crm" className="text-primary underline-offset-2 hover:underline">
          CRM & Pipeline
        </Link>{" "}
        is available on Professional+.
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
