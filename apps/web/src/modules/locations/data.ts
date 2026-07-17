import { listDemoLocations } from "./demo-data";
import type { BusinessLocation } from "./types";

export async function listLocations(organizationId: string): Promise<BusinessLocation[]> {
  return listDemoLocations(organizationId);
}

export async function getLocationMetrics(organizationId: string) {
  const locations = await listLocations(organizationId);
  return {
    total: locations.length,
    states: new Set(locations.map((l) => l.region)).size,
    calls: locations.reduce((sum, l) => sum + l.callsThisMonth, 0),
    appointments: locations.reduce((sum, l) => sum + l.appointmentsThisMonth, 0),
    teamMembers: locations.reduce((sum, l) => sum + l.teamCount, 0),
  };
}
