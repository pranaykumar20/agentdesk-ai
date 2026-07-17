import { MapPin, Phone, CalendarDays, Users } from "lucide-react";
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
import { getLocationMetrics, listLocations } from "@/modules/locations/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Locations" };

export default async function LocationsPage() {
  const { organization } = await requireOrg();
  const [locations, metrics] = await Promise.all([
    listLocations(organization.id),
    getLocationMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Multi-Location Management"
        description="Manage all your business locations, settings, and performance in one place."
      />

      <Tabs
        className="mb-6"
        activeId="locations"
        items={[
          { id: "locations", label: "Locations", href: "/dashboard/locations", count: metrics.total },
          { id: "performance", label: "Performance", href: "/dashboard/locations" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Locations"
          value={metrics.total}
          hint={`Across ${metrics.states} states`}
          icon={MapPin}
        />
        <MetricCard
          label="Calls (This Month)"
          value={metrics.calls.toLocaleString()}
          icon={Phone}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Appointments (This Month)"
          value={metrics.appointments.toLocaleString()}
          icon={CalendarDays}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <MetricCard
          label="Active Team Members"
          value={metrics.teamMembers}
          hint="Across all locations"
          icon={Users}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead>Location</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {location.name}
                    {location.isPrimary ? (
                      <span className="ml-2 text-xs font-normal text-primary">HQ</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.city}, {location.region}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">{location.phone}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {location.teamCount}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {location.callsThisMonth}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {location.appointmentsThisMonth}
                </TableCell>
                <TableCell>
                  <Badge variant={location.status === "active" ? "success" : "secondary"}>
                    {location.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
