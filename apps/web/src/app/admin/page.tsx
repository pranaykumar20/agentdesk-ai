import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Flag, HeartPulse, ScrollText, Shield } from "lucide-react";
import { requireUser } from "@/lib/auth";
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
import { getPlatformAdminSummary, isPlatformAdmin } from "@/modules/platform-admin/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Platform Admin" };

function healthVariant(status: "healthy" | "degraded") {
  return status === "healthy" ? ("success" as const) : ("warning" as const);
}

function tenantVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "trialing") return "default" as const;
  if (status === "past_due") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminPage() {
  const user = await requireUser();
  const allowed = await isPlatformAdmin(user.id, user.email);
  if (!allowed) {
    redirect("/dashboard");
  }

  const { tenants, health, flags, audit } = await getPlatformAdminSummary();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Back to dashboard
        </Link>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3.5 w-3.5" />
          Platform admin
        </Badge>
      </div>

      <PageHeader
        title="Super Admin"
        description="Manage tenants, feature flags, system health, and platform audit activity."
      />

      <Tabs
        className="mb-6"
        activeId="tenants"
        items={[
          { id: "tenants", label: "Tenants", href: "/admin", count: tenants.length },
          { id: "flags", label: "Feature Flags", href: "/admin" },
          { id: "health", label: "System Health", href: "/admin" },
          { id: "audit", label: "Audit Log", href: "/admin" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tenants" value={tenants.length} icon={Building2} />
        <MetricCard label="Feature Flags" value={flags.length} icon={Flag} />
        <MetricCard
          label="Voice Provider"
          value={health.voice === "healthy" ? "Healthy" : "Degraded"}
          icon={HeartPulse}
          iconClassName={
            health.voice === "healthy"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }
        />
        <MetricCard label="Audit Events" value={audit.length} icon={ScrollText} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Usage (mins)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium text-foreground">{tenant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.plan}</TableCell>
                  <TableCell>
                    <Badge variant={tenantVariant(tenant.status)}>{tenant.status}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{tenant.seats}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {tenant.usageMinutes.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(
                [
                  ["API", health.api],
                  ["Webhooks", health.webhooks],
                  ["Voice", health.voice],
                  ["Database", health.database],
                ] as const
              ).map(([label, status]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant={healthVariant(status)}>{status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {flags.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{flag.key}</p>
                    <p className="text-xs text-muted-foreground">{flag.description}</p>
                  </div>
                  <Badge variant={flag.defaultEnabled ? "success" : "secondary"}>
                    {flag.defaultEnabled ? "on" : "off"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {audit.map((event) => (
                <div key={event.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{event.action}</p>
                  <p className="text-xs text-muted-foreground">{event.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {event.actor} · {event.at}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
