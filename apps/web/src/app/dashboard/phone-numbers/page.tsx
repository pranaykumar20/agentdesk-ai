import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { AddPhoneNumberButton } from "@/components/phone-numbers/AddPhoneNumberButton";
import { getPhoneMetrics, listPhoneNumbers } from "@/modules/phone-numbers/data";
import { formatDateTime } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Phone Numbers" };

function statusVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "forwarding" || status === "in_use") return "warning" as const;
  return "destructive" as const;
}

export default async function PhoneNumbersPage() {
  const { organization } = await requireOrg();
  const [numbers, metrics] = await Promise.all([
    listPhoneNumbers(organization.id),
    getPhoneMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Phone Numbers"
        description="Manage business numbers via the telephony provider interface (mock by default)."
        actions={<AddPhoneNumberButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Numbers" value={metrics.total} />
        <MetricCard label="Active" value={metrics.active} />
        <MetricCard label="In Use" value={metrics.inUse} />
        <MetricCard label="Forwarding" value={metrics.forwarding} />
        <MetricCard label="Unavailable" value={metrics.unavailable} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Phone Number</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Assigned To</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Calls (30 days)</th>
                <th className="px-3 py-3 font-medium">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {numbers.map((number) => (
                <tr key={number.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{number.e164}</p>
                    <p className="text-xs text-muted-foreground">
                      {number.friendlyName} · {number.provider}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{number.numberType === "toll_free" ? "Toll Free" : "Local"}</Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{number.assignedTo}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(number.status)}>{number.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {number.callsLast30Days}{" "}
                    <span className={number.callsTrendPct >= 0 ? "text-success" : "text-destructive"}>
                      {number.callsTrendPct >= 0 ? "↗" : "↘"} {Math.abs(number.callsTrendPct)}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(number.lastActivityAt, organization.timezone)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
