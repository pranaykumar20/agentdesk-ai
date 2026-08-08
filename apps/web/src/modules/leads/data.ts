import { shouldUseDemoData } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { LeadListItem } from "./types";

export async function listLeads(organizationId: string): Promise<LeadListItem[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data: leads, error } = await supabase
        .from("leads")
        .select("id, organization_id, contact_id, source, status, score, notes, created_at, updated_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const contactIds = (leads ?? [])
        .map((l) => l.contact_id)
        .filter((id): id is string => Boolean(id));

      const contactById = new Map<string, { full_name: string | null; phone: string | null }>();
      if (contactIds.length > 0) {
        const { data: contacts } = await supabase
          .from("contacts")
          .select("id, full_name, phone")
          .in("id", contactIds);
        for (const c of contacts ?? []) {
          contactById.set(c.id, { full_name: c.full_name, phone: c.phone });
        }
      }

      return (leads ?? []).map((lead) => {
        const contact = lead.contact_id ? contactById.get(lead.contact_id) : null;
        return {
          id: lead.id,
          organizationId: lead.organization_id,
          contactId: lead.contact_id,
          contactName: contact?.full_name ?? "Unknown caller",
          contactPhone: contact?.phone ?? null,
          source: lead.source,
          status: lead.status,
          score: lead.score,
          notes: lead.notes,
          createdAt: lead.created_at,
          updatedAt: lead.updated_at,
        };
      });
    } catch {
      // fall through
    }
  }

  if (shouldUseDemoData()) {
    return [
      {
        id: "lead-demo-1",
        organizationId,
        contactId: null,
        contactName: "Jordan Lee",
        contactPhone: "+15550100",
        source: "voice",
        status: "new",
        score: null,
        notes: "Asked about Saturday availability (demo)",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  return [];
}

export async function getLeadMetrics(organizationId: string) {
  const items = await listLeads(organizationId);
  return {
    total: items.length,
    newCount: items.filter((l) => l.status === "new").length,
    callbackCount: items.filter((l) => l.status === "callback").length,
    qualifiedCount: items.filter((l) => l.status === "qualified").length,
  };
}
