import { randomBytes } from "node:crypto";
import type { UserRole } from "@/lib/permissions";
import { addDemoMember, getDemoTeam, patchDemoMember } from "./demo-data";
import type { MemberStatus, TeamMember, TeamMetrics } from "./types";

export async function listTeamMembers(organizationId: string): Promise<TeamMember[]> {
  return getDemoTeam(organizationId);
}

export async function getTeamMetrics(organizationId: string): Promise<TeamMetrics> {
  const members = await listTeamMembers(organizationId);
  return {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    admins: members.filter((m) => m.role === "ADMIN" || m.role === "OWNER").length,
    managers: members.filter((m) => m.role === "MANAGER").length,
    agents: members.filter((m) => m.role === "AGENT").length,
  };
}

export async function inviteTeamMember(input: {
  organizationId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
}): Promise<TeamMember & { inviteToken: string }> {
  const inviteToken = randomBytes(24).toString("hex");
  const member: TeamMember = {
    id: `tm-${crypto.randomUUID().slice(0, 8)}`,
    organizationId: input.organizationId,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    department: input.department,
    phone: null,
    status: "invited",
    joinedAt: new Date().toISOString(),
    lastActiveAt: null,
    inviteTokenExpiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
  };
  addDemoMember(member);
  return { ...member, inviteToken };
}

export async function updateTeamMember(
  organizationId: string,
  id: string,
  patch: { role?: UserRole; department?: string; status?: MemberStatus },
): Promise<TeamMember | null> {
  return patchDemoMember(organizationId, id, patch);
}
