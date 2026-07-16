import type { AppointmentListItem, AppointmentStatus } from "./types";

const PATIENTS = [
  ["John Smith", "(513) 555-0198", "Teeth Cleaning", "Dr. Sarah Johnson"],
  ["Sarah Johnson", "(513) 555-0142", "Dental Checkup", "Dr. Sarah Johnson"],
  ["Michael Brown", "(513) 555-0177", "Tooth Extraction Consultation", "Dr. James Lee"],
  ["Emily Davis", "(513) 555-0111", "Teeth Cleaning", "Dr. Ava Martinez"],
  ["David Wilson", "(513) 555-0166", "Dental Checkup", "Dr. Sarah Johnson"],
] as const;

function statusForIndex(i: number): AppointmentStatus {
  if (i % 8 === 0) return "cancelled";
  if (i % 5 === 0) return "pending";
  if (i % 11 === 0) return "no_show";
  return "confirmed";
}

export function buildDemoAppointments(organizationId: string): AppointmentListItem[] {
  return Array.from({ length: 24 }, (_, i) => {
    const [name, phone, service, provider] = PATIENTS[i % PATIENTS.length]!;
    const start = new Date();
    start.setDate(start.getDate() + (i % 10) - 2);
    start.setHours(9 + (i % 6), i % 2 === 0 ? 0 : 30, 0, 0);
    const end = new Date(start.getTime() + 30 * 60_000);
    return {
      id: `demo-appt-${String(i + 1).padStart(3, "0")}`,
      organizationId,
      contactName: name,
      contactPhone: phone,
      serviceName: service,
      providerName: provider,
      status: statusForIndex(i),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      source: i % 3 === 0 ? "ai_agent" : "human",
      createdByAi: i % 3 === 0,
      notes: null,
    };
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** In-memory store for demo creates during a server process lifetime */
const created = new Map<string, AppointmentListItem[]>();

export function getDemoAppointments(organizationId: string): AppointmentListItem[] {
  const extras = created.get(organizationId) ?? [];
  return [...extras, ...buildDemoAppointments(organizationId)];
}

export function addDemoAppointment(item: AppointmentListItem): void {
  const list = created.get(item.organizationId) ?? [];
  created.set(item.organizationId, [item, ...list]);
}

export function updateDemoAppointmentStatus(
  organizationId: string,
  id: string,
  status: AppointmentStatus,
): AppointmentListItem | null {
  const all = getDemoAppointments(organizationId);
  const match = all.find((a) => a.id === id);
  if (!match) return null;
  const updated = { ...match, status };
  const extras = created.get(organizationId) ?? [];
  const idx = extras.findIndex((a) => a.id === id);
  if (idx >= 0) {
    extras[idx] = updated;
    created.set(organizationId, extras);
  } else {
    created.set(organizationId, [updated, ...extras]);
  }
  return updated;
}
