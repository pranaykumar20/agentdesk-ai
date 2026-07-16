import type { UserRole } from "@/lib/permissions";

export type MemberStatus = "active" | "invited" | "disabled";

export type TeamMember = {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string | null;
  status: MemberStatus;
  joinedAt: string;
  lastActiveAt: string | null;
  inviteTokenExpiresAt?: string | null;
};

export type TeamMetrics = {
  total: number;
  active: number;
  admins: number;
  managers: number;
  agents: number;
};
