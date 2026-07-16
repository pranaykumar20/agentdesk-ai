import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AppointmentStatusBadge } from "@/components/dashboard/StatusBadge";
import { Pagination } from "@/components/dashboard/Pagination";
import { CreateAppointmentForm } from "@/components/appointments/CreateAppointmentForm";
import { AppointmentStatusActions } from "@/components/appointments/AppointmentStatusActions";
import { getAppointmentMetrics, listAppointments } from "@/modules/appointments/data";
import { formatDateTime, initials } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments" };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { organization } = await requireOrg();
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const q = params.q ?? "";
  const status = params.status ?? "all";

  const [result, metrics] = await Promise.all([
    listAppointments(organization.id, { q, status, page, pageSize: 10 }),
    getAppointmentMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="List view with create, confirm, and cancel actions."
        actions={<CreateAppointmentForm />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Appointments" value={metrics.total} hint="Visible window" />
        <MetricCard
          label="Confirmed"
          value={metrics.confirmed}
          hint={metrics.total ? `${((metrics.confirmed / metrics.total) * 100).toFixed(1)}% of total` : undefined}
        />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          hint={metrics.total ? `${((metrics.pending / metrics.total) * 100).toFixed(1)}% of total` : undefined}
        />
        <MetricCard
          label="Cancelled / No Show"
          value={metrics.cancelled}
          hint={metrics.total ? `${((metrics.cancelled / metrics.total) * 100).toFixed(1)}% of total` : undefined}
        />
      </div>

      <form className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row" method="get">
        <label className="sr-only" htmlFor="q">
          Search appointments
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search by name, phone or service..."
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Date & time</th>
                <th className="px-3 py-3 font-medium">Provider</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((appt) => (
                <tr key={appt.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {initials(appt.contactName)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{appt.contactName}</p>
                        <p className="text-xs text-muted-foreground">{appt.contactPhone ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground">{appt.serviceName}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(appt.startsAt, organization.timezone)}
                  </td>
                  <td className="px-3 py-3 text-foreground">{appt.providerName}</td>
                  <td className="px-3 py-3">
                    <AppointmentStatusBadge status={appt.status} />
                  </td>
                  <td className="px-3 py-3">
                    <AppointmentStatusActions id={appt.id} status={appt.status} />
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
          basePath="/dashboard/appointments"
          searchParams={{
            q: q || undefined,
            status: status === "all" ? undefined : status,
          }}
        />
      </div>
    </div>
  );
}
