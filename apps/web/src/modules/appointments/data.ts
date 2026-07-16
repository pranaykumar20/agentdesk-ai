import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { PaginatedResult } from "@/modules/calls/types";
import {
  addDemoAppointment,
  getDemoAppointments,
  updateDemoAppointmentStatus,
} from "./demo-data";
import type {
  AppointmentFilters,
  AppointmentListItem,
  AppointmentStatus,
  CreateAppointmentInput,
} from "./types";

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

function filterAppointments(
  items: AppointmentListItem[],
  filters: AppointmentFilters,
): AppointmentListItem[] {
  let result = [...items];
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (a) =>
        a.contactName.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q) ||
        (a.contactPhone?.includes(q) ?? false),
    );
  }
  if (filters.status && filters.status !== "all") {
    result = result.filter((a) => a.status === filters.status);
  }
  return result;
}

export async function listAppointments(
  organizationId: string,
  filters: AppointmentFilters = {},
): Promise<PaginatedResult<AppointmentListItem>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from("appointments")
        .select("*", { count: "exact" })
        .eq("organization_id", organizationId)
        .order("starts_at", { ascending: true });

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query.range(from, to);
      if (!error && data && (count ?? 0) > 0) {
        const items: AppointmentListItem[] = data.map((row) => ({
          id: row.id,
          organizationId: row.organization_id,
          contactName: "Patient",
          contactPhone: null,
          serviceName: "Service",
          providerName: "Provider",
          status: row.status as AppointmentStatus,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          source: row.source,
          createdByAi: row.created_by_ai,
          notes: row.notes,
        }));
        return {
          items,
          total: count ?? items.length,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil((count ?? items.length) / pageSize)),
        };
      }
    } catch {
      // fall through to demo
    }
  }

  return paginate(filterAppointments(getDemoAppointments(organizationId), filters), page, pageSize);
}

export async function getAppointmentMetrics(organizationId: string) {
  const all = (await listAppointments(organizationId, { page: 1, pageSize: 100 })).items;
  const total = all.length;
  const confirmed = all.filter((a) => a.status === "confirmed").length;
  const pending = all.filter((a) => a.status === "pending").length;
  const cancelled = all.filter((a) => a.status === "cancelled" || a.status === "no_show").length;
  return { total, confirmed, pending, cancelled };
}

export async function createAppointment(
  organizationId: string,
  input: CreateAppointmentInput,
): Promise<AppointmentListItem> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          organization_id: organizationId,
          status: "pending",
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          notes: input.notes ?? null,
          source: "human",
          created_by_ai: false,
        })
        .select("*")
        .single();

      if (!error && data) {
        return {
          id: data.id,
          organizationId,
          contactName: input.contactName,
          contactPhone: null,
          serviceName: input.serviceName,
          providerName: input.providerName,
          status: data.status as AppointmentStatus,
          startsAt: data.starts_at,
          endsAt: data.ends_at,
          source: data.source,
          createdByAi: false,
          notes: data.notes,
        };
      }
    } catch {
      // demo fallback
    }
  }

  const item: AppointmentListItem = {
    id: `demo-appt-${crypto.randomUUID().slice(0, 8)}`,
    organizationId,
    contactName: input.contactName,
    contactPhone: null,
    serviceName: input.serviceName,
    providerName: input.providerName,
    status: "pending",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    source: "human",
    createdByAi: false,
    notes: input.notes ?? null,
  };
  addDemoAppointment(item);
  return item;
}

export async function updateAppointmentStatus(
  organizationId: string,
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentListItem | null> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("organization_id", organizationId)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          organizationId,
          contactName: "Patient",
          contactPhone: null,
          serviceName: "Service",
          providerName: "Provider",
          status: data.status as AppointmentStatus,
          startsAt: data.starts_at,
          endsAt: data.ends_at,
          source: data.source,
          createdByAi: data.created_by_ai,
          notes: data.notes,
        };
      }
    } catch {
      // demo fallback
    }
  }

  return updateDemoAppointmentStatus(organizationId, id, status);
}

export async function getUpcomingAppointments(organizationId: string, limit = 3) {
  const now = Date.now();
  const result = await listAppointments(organizationId, { page: 1, pageSize: 50 });
  return result.items
    .filter((a) => new Date(a.startsAt).getTime() >= now && a.status !== "cancelled")
    .slice(0, limit);
}
