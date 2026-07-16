import type { PhoneNumberItem } from "./types";

const store = new Map<string, PhoneNumberItem[]>();

export function buildDemoNumbers(organizationId: string): PhoneNumberItem[] {
  return [
    {
      id: "pn-001",
      organizationId,
      e164: "+1 (513) 555-0100",
      friendlyName: "Primary",
      numberType: "local",
      provider: "mock",
      assignedTo: "Smile Assistant (AI Agent)",
      location: "Cincinnati, OH",
      status: "active",
      callsLast30Days: 256,
      callsTrendPct: 12,
      lastActivityAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
    {
      id: "pn-002",
      organizationId,
      e164: "+1 (513) 555-0101",
      friendlyName: "Appointments Line",
      numberType: "local",
      provider: "mock",
      assignedTo: "James (Human Agent)",
      location: "Cincinnati, OH",
      status: "active",
      callsLast30Days: 128,
      callsTrendPct: 8,
      lastActivityAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    },
    {
      id: "pn-003",
      organizationId,
      e164: "+1 (800) 555-0199",
      friendlyName: "Toll Free",
      numberType: "toll_free",
      provider: "mock",
      assignedTo: "After Hours Flow (IVR)",
      location: "Cincinnati, OH",
      status: "forwarding",
      callsLast30Days: 64,
      callsTrendPct: -3,
      lastActivityAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: "pn-004",
      organizationId,
      e164: "+1 (513) 555-0108",
      friendlyName: "Billing",
      numberType: "local",
      provider: "mock",
      assignedTo: "Billing Team (Department)",
      location: "Cincinnati, OH",
      status: "in_use",
      callsLast30Days: 42,
      callsTrendPct: 5,
      lastActivityAt: new Date(Date.now() - 86400_000).toISOString(),
    },
    {
      id: "pn-005",
      organizationId,
      e164: "+1 (513) 555-0110",
      friendlyName: "Overflow",
      numberType: "local",
      provider: "mock",
      assignedTo: "Unassigned",
      location: "Cincinnati, OH",
      status: "unavailable",
      callsLast30Days: 0,
      callsTrendPct: 0,
      lastActivityAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    },
  ];
}

export function getDemoNumbers(organizationId: string): PhoneNumberItem[] {
  return store.get(organizationId) ?? buildDemoNumbers(organizationId);
}

export function setDemoNumbers(organizationId: string, items: PhoneNumberItem[]): void {
  store.set(organizationId, items);
}

export function addDemoNumber(item: PhoneNumberItem): void {
  const list = getDemoNumbers(item.organizationId);
  setDemoNumbers(item.organizationId, [item, ...list]);
}
