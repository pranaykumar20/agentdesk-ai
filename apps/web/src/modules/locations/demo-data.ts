import type { BusinessLocation } from "./types";

const store = new Map<string, BusinessLocation[]>();

function defaults(): BusinessLocation[] {
  return [
    {
      id: "loc-1",
      name: "Downtown Cincinnati (HQ)",
      city: "Cincinnati",
      region: "OH",
      phone: "+1 (513) 555-0100",
      status: "active",
      teamCount: 12,
      callsThisMonth: 842,
      appointmentsThisMonth: 156,
      isPrimary: true,
    },
    {
      id: "loc-2",
      name: "West Chester",
      city: "West Chester",
      region: "OH",
      phone: "+1 (513) 555-0142",
      status: "active",
      teamCount: 8,
      callsThisMonth: 512,
      appointmentsThisMonth: 98,
      isPrimary: false,
    },
    {
      id: "loc-3",
      name: "Florence",
      city: "Florence",
      region: "KY",
      phone: "+1 (859) 555-0199",
      status: "active",
      teamCount: 6,
      callsThisMonth: 388,
      appointmentsThisMonth: 74,
      isPrimary: false,
    },
  ];
}

export function listDemoLocations(organizationId: string): BusinessLocation[] {
  if (!store.has(organizationId)) store.set(organizationId, defaults());
  return store.get(organizationId)!;
}
