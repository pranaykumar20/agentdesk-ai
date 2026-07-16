import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { InviteMemberForm } from "@/components/team/InviteMemberForm";
import { MemberRoleSelect } from "@/components/team/MemberRoleSelect";
import { getTeamMetrics, listTeamMembers } from "@/modules/team/data";
import { formatDate, initials } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

function roleVariant(role: string) {
  if (role === "ADMIN" || role === "OWNER") return "default" as const;
  if (role === "AGENT") return "secondary" as const;
  return "outline" as const;
}

export default async function TeamPage() {
  const { organization } = await requireOrg();
  const [members, metrics] = await Promise.all([
    listTeamMembers(organization.id),
    getTeamMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Team"
        description="Invite members, manage roles, and assign departments."
        actions={<InviteMemberForm />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Members" value={metrics.total} hint="All team members" />
        <MetricCard label="Active" value={metrics.active} hint="Currently active" />
        <MetricCard label="Admins" value={metrics.admins} hint="Full access" />
        <MetricCard label="Managers" value={metrics.managers} hint="Ops leads" />
        <MetricCard label="Agents" value={metrics.agents} hint="Handling conversations" />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Department</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {initials(member.fullName)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={roleVariant(member.role)}>{member.role}</Badge>
                      <MemberRoleSelect id={member.id} role={member.role} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{member.department}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                      <span
                        className={
                          member.status === "active"
                            ? "h-2 w-2 rounded-full bg-success"
                            : member.status === "invited"
                              ? "h-2 w-2 rounded-full bg-warning"
                              : "h-2 w-2 rounded-full bg-destructive"
                        }
                      />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDate(member.joinedAt, organization.timezone)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {member.lastActiveAt
                      ? formatDate(member.lastActiveAt, organization.timezone)
                      : "—"}
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
