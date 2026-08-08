import { getTelephonyProvider } from "@/lib/providers";
import { shouldUseDemoData } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getPublishedAgentForOrg } from "@/modules/agents/data";
import { addDemoNumber, getDemoNumbers, setDemoNumbers } from "./demo-data";
import type { PhoneNumberItem, PhoneNumberStatus } from "./types";

function mapRow(
  row: {
    id: string;
    organization_id: string;
    e164: string;
    friendly_name: string | null;
    number_type: string;
    provider: string;
    provider_sid: string | null;
    status: string;
    updated_at: string;
  },
  agentName: string | null,
  agentId: string | null,
): PhoneNumberItem {
  return {
    id: row.id,
    organizationId: row.organization_id,
    e164: row.e164,
    friendlyName: row.friendly_name ?? row.e164,
    numberType: row.number_type === "toll_free" ? "toll_free" : "local",
    provider: row.provider,
    providerSid: row.provider_sid,
    agentId,
    assignedTo: agentName ?? "Unassigned",
    location: "—",
    status: (row.status as PhoneNumberStatus) || "active",
    callsLast30Days: 0,
    callsTrendPct: 0,
    lastActivityAt: row.updated_at,
  };
}

export async function listPhoneNumbers(organizationId: string): Promise<PhoneNumberItem[]> {
  if (getSupabaseEnv().configured) {
    try {
      const supabase = await createClient();
      const { data: rows, error } = await supabase
        .from("phone_numbers")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: assignments } = await supabase
        .from("phone_number_assignments")
        .select("phone_number_id, agent_id")
        .eq("organization_id", organizationId);

      const agentIds = (assignments ?? [])
        .map((a) => a.agent_id)
        .filter((id): id is string => Boolean(id));

      const agentNameById = new Map<string, string>();
      if (agentIds.length > 0) {
        const { data: agents } = await supabase
          .from("ai_agents")
          .select("id, name")
          .in("id", agentIds);
        for (const a of agents ?? []) agentNameById.set(a.id, a.name);
      }

      const assignmentByPhone = new Map(
        (assignments ?? []).map((a) => [a.phone_number_id, a.agent_id]),
      );

      return (rows ?? []).map((row) => {
        const agentId = assignmentByPhone.get(row.id) ?? null;
        return mapRow(row, agentId ? (agentNameById.get(agentId) ?? null) : null, agentId);
      });
    } catch {
      // fall through
    }
  }

  if (shouldUseDemoData()) return getDemoNumbers(organizationId);
  return [];
}

export async function getPhoneMetrics(organizationId: string) {
  const numbers = await listPhoneNumbers(organizationId);
  return {
    total: numbers.length,
    active: numbers.filter((n) => n.status === "active").length,
    inUse: numbers.filter((n) => n.status === "in_use").length,
    forwarding: numbers.filter((n) => n.status === "forwarding").length,
    unavailable: numbers.filter((n) => n.status === "unavailable").length,
  };
}

export async function provisionPhoneNumber(
  organizationId: string,
  options?: { areaCode?: string; agentId?: string },
): Promise<PhoneNumberItem> {
  let agent = options?.agentId
    ? await (async () => {
        const { getAiEmployeeById } = await import("@/modules/agents/data");
        return getAiEmployeeById(organizationId, options.agentId!);
      })()
    : await getPublishedAgentForOrg(organizationId);

  if (!agent?.externalAgentId) {
    throw new Error("Publish an AI employee before provisioning a phone number");
  }

  const telephony = getTelephonyProvider();
  const provisioned = await telephony.provisionNumber({
    organizationId,
    areaCode: options?.areaCode ?? "513",
    inboundAgentId: agent.externalAgentId,
  });

  if (!getSupabaseEnv().configured) {
    if (!shouldUseDemoData()) {
      throw new Error("Supabase is required to provision phone numbers outside demo mode");
    }
    const item: PhoneNumberItem = {
      id: `pn-${crypto.randomUUID().slice(0, 8)}`,
      organizationId,
      e164: provisioned.e164,
      friendlyName: "New Number",
      numberType: "local",
      provider: telephony.name,
      providerSid: provisioned.providerSid,
      agentId: agent.id,
      assignedTo: agent.name,
      location: "—",
      status: "active",
      callsLast30Days: 0,
      callsTrendPct: 0,
      lastActivityAt: new Date().toISOString(),
    };
    addDemoNumber(item);
    return item;
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("phone_numbers")
    .insert({
      organization_id: organizationId,
      e164: provisioned.e164,
      friendly_name: "AI Receptionist Line",
      number_type: "local",
      provider: telephony.name,
      provider_sid: provisioned.providerSid,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Failed to save phone number");
  }

  await supabase.from("phone_number_assignments").insert({
    organization_id: organizationId,
    phone_number_id: row.id,
    agent_id: agent.id,
    assignment_type: "ai_agent",
  });

  return mapRow(row, agent.name, agent.id);
}

export async function updatePhoneNumber(
  organizationId: string,
  id: string,
  patch: { friendlyName?: string; status?: PhoneNumberStatus; assignedTo?: string; agentId?: string },
): Promise<PhoneNumberItem | null> {
  if (getSupabaseEnv().configured) {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("phone_numbers")
      .update({
        friendly_name: patch.friendlyName,
        status: patch.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select("*")
      .maybeSingle();
    if (error || !row) return null;

    if (patch.agentId) {
      const agent = await (await import("@/modules/agents/data")).getAiEmployeeById(
        organizationId,
        patch.agentId,
      );
      if (agent?.externalAgentId) {
        const telephony = getTelephonyProvider();
        await telephony.connectNumber({
          organizationId,
          e164: row.e164,
          inboundAgentId: agent.externalAgentId,
        });
        await supabase.from("phone_number_assignments").delete().eq("phone_number_id", id);
        await supabase.from("phone_number_assignments").insert({
          organization_id: organizationId,
          phone_number_id: id,
          agent_id: agent.id,
          assignment_type: "ai_agent",
        });
        return mapRow(row, agent.name, agent.id);
      }
    }

    return mapRow(row, patch.assignedTo ?? null, null);
  }

  if (!shouldUseDemoData()) return null;
  const numbers = await listPhoneNumbers(organizationId);
  const next = numbers.map((n) => (n.id === id ? { ...n, ...patch } : n));
  setDemoNumbers(organizationId, next);
  return next.find((n) => n.id === id) ?? null;
}
