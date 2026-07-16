export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

export type AppointmentListItem = {
  id: string;
  organizationId: string;
  contactName: string;
  contactPhone: string | null;
  serviceName: string;
  providerName: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  source: string | null;
  createdByAi: boolean;
  notes: string | null;
};

export type AppointmentFilters = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type CreateAppointmentInput = {
  contactName: string;
  serviceName: string;
  providerName: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
};
