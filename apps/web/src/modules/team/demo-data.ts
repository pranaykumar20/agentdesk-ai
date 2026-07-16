import type { TeamMember } from "./types";

const store = new Map<string, TeamMember[]>();

export function buildDemoTeam(organizationId: string): TeamMember[] {
  return [
    {
      id: "tm-001",
      organizationId,
      fullName: "Ava Martinez",
      email: "ava@smiledentalcare.example",
      role: "ADMIN",
      department: "Operations",
      phone: "(513) 555-0102",
      status: "active",
      joinedAt: "2024-01-12T15:00:00.000Z",
      lastActiveAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
    {
      id: "tm-002",
      organizationId,
      fullName: "James Lee",
      email: "james@smiledentalcare.example",
      role: "MANAGER",
      department: "Front Desk",
      phone: "(513) 555-0103",
      status: "active",
      joinedAt: "2024-02-01T15:00:00.000Z",
      lastActiveAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
    {
      id: "tm-003",
      organizationId,
      fullName: "Sarah Johnson",
      email: "sarah@smiledentalcare.example",
      role: "AGENT",
      department: "Clinical",
      phone: "(513) 555-0104",
      status: "active",
      joinedAt: "2024-03-18T15:00:00.000Z",
      lastActiveAt: new Date(Date.now() - 86400_000).toISOString(),
    },
    {
      id: "tm-004",
      organizationId,
      fullName: "Michael Brown",
      email: "michael@smiledentalcare.example",
      role: "AGENT",
      department: "Billing",
      phone: null,
      status: "invited",
      joinedAt: new Date().toISOString(),
      lastActiveAt: null,
      inviteTokenExpiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    },
    {
      id: "tm-005",
      organizationId,
      fullName: "Emily Davis",
      email: "emily@smiledentalcare.example",
      role: "VIEWER",
      department: "Management",
      phone: "(513) 555-0105",
      status: "disabled",
      joinedAt: "2024-04-02T15:00:00.000Z",
      lastActiveAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
    },
  ];
}

export function getDemoTeam(organizationId: string): TeamMember[] {
  const extras = store.get(organizationId) ?? [];
  return [...extras, ...buildDemoTeam(organizationId)];
}

export function addDemoMember(member: TeamMember): void {
  const list = store.get(member.organizationId) ?? [];
  store.set(member.organizationId, [member, ...list]);
}

export function patchDemoMember(
  organizationId: string,
  id: string,
  patch: Partial<TeamMember>,
): TeamMember | null {
  const all = getDemoTeam(organizationId);
  const match = all.find((m) => m.id === id);
  if (!match) return null;
  const updated = { ...match, ...patch };
  const extras = store.get(organizationId) ?? [];
  const idx = extras.findIndex((m) => m.id === id);
  if (idx >= 0) {
    extras[idx] = updated;
    store.set(organizationId, extras);
  } else {
    store.set(organizationId, [updated, ...extras]);
  }
  return updated;
}
