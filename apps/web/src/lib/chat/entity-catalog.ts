import type { OrgContext } from "@/lib/auth";
import { can, type Resource } from "@/lib/permissions";
import { listAiEmployees } from "@/modules/agents/data";
import { listAppointments } from "@/modules/appointments/data";
import { listCallQueues } from "@/modules/call-queues/data";
import { listCalls } from "@/modules/calls/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { listIntegrations } from "@/modules/integrations/data";
import { listKnowledgeDocuments } from "@/modules/knowledge/data";
import { listLocations } from "@/modules/locations/data";
import { listMarketplaceAgents } from "@/modules/marketplace/data";
import { listPhoneNumbers } from "@/modules/phone-numbers/data";
import { listRoutingRules } from "@/modules/routing/data";
import { listTeamMembers } from "@/modules/team/data";
import { listTrainingJobs } from "@/modules/training/data";
import { listVoiceFlows } from "@/modules/voice-flows/data";
import { listWhatsappConversations, getWhatsappSummary } from "@/modules/whatsapp/data";
import { listWorkflows } from "@/modules/workflows/data";
import { listInvoices } from "@/modules/billing/data";
import { maskPhone } from "./account-context";

export type AccountEntityType =
  | "call"
  | "appointment"
  | "team_member"
  | "call_queue"
  | "ai_employee"
  | "marketplace_agent"
  | "training_job"
  | "integration"
  | "location"
  | "phone_number"
  | "crm_deal"
  | "knowledge_doc"
  | "workflow"
  | "voice_flow"
  | "routing_rule"
  | "whatsapp_conversation"
  | "whatsapp_workflow"
  | "invoice";

/** Format call duration seconds as mm:ss (e.g. 93 → 01:33). */
export function formatCallDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function callStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Answered";
    case "missed":
      return "Missed";
    case "voicemail":
      return "Voicemail";
    default:
      return status;
  }
}

export type AccountEntity = {
  id: string;
  type: AccountEntityType;
  name: string;
  aliases: string[];
  path: string;
  label: string;
  fields: Record<string, string | number | boolean | null>;
};

function entity(
  partial: Omit<AccountEntity, "aliases"> & { aliases?: string[] },
): AccountEntity {
  return {
    ...partial,
    aliases: partial.aliases ?? [],
  };
}

async function ifCan<T>(
  ctx: OrgContext,
  resource: Resource,
  load: () => Promise<T[]>,
): Promise<T[]> {
  if (!can(ctx.role, "read", resource)) return [];
  try {
    return await load();
  } catch {
    return [];
  }
}

/** Build a searchable catalog of named account entities for the active org. */
export async function buildAccountEntityCatalog(
  ctx: OrgContext,
): Promise<AccountEntity[]> {
  const orgId = ctx.organization.id;
  const entities: AccountEntity[] = [];

  const [
    callsPage,
    appointmentsPage,
    teamMembers,
    queues,
    employees,
    marketplace,
    trainings,
    integrations,
    locations,
    phones,
    crm,
    knowledge,
    workflows,
    voiceFlows,
    routing,
    whatsapp,
    invoices,
  ] = await Promise.all([
    can(ctx.role, "read", "calls")
      ? listCalls(orgId, { page: 1, pageSize: 40 }).catch(() => ({ items: [] as Awaited<
          ReturnType<typeof listCalls>
        >["items"] }))
      : Promise.resolve({ items: [] as Awaited<ReturnType<typeof listCalls>>["items"] }),
    can(ctx.role, "read", "appointments")
      ? listAppointments(orgId, { page: 1, pageSize: 40 }).catch(() => ({
          items: [] as Awaited<ReturnType<typeof listAppointments>>["items"],
        }))
      : Promise.resolve({ items: [] as Awaited<ReturnType<typeof listAppointments>>["items"] }),
    ifCan(ctx, "members", () => listTeamMembers(orgId)),
    ifCan(ctx, "call_queues", () => listCallQueues(orgId)),
    ifCan(ctx, "agents", () => listAiEmployees(orgId)),
    can(ctx.role, "read", "marketplace")
      ? listMarketplaceAgents().catch(() => [])
      : Promise.resolve([]),
    ifCan(ctx, "training", () => listTrainingJobs(orgId)),
    ifCan(ctx, "integrations", () => listIntegrations(orgId)),
    ifCan(ctx, "locations", () => listLocations(orgId)),
    ifCan(ctx, "phone_numbers", () => listPhoneNumbers(orgId)),
    can(ctx.role, "read", "crm")
      ? getCrmPipelineSummary(orgId)
          .then((s) => s.deals)
          .catch(() => [])
      : Promise.resolve([]),
    ifCan(ctx, "knowledge", () => listKnowledgeDocuments(orgId)),
    ifCan(ctx, "workflows", () => listWorkflows(orgId)),
    ifCan(ctx, "voice_flows", () => listVoiceFlows(orgId)),
    ifCan(ctx, "routing", () => listRoutingRules(orgId)),
    can(ctx.role, "read", "whatsapp")
      ? getWhatsappSummary(orgId).catch(async () => ({
          conversations: await listWhatsappConversations(orgId).catch(() => []),
          workflows: [] as Array<{ name: string; volume: number; pct: number }>,
          metrics: null,
        }))
      : Promise.resolve({ conversations: [], workflows: [], metrics: null }),
    ifCan(ctx, "billing", () => listInvoices(orgId)),
  ]);

  // Prefer one entity per caller name (most recent call first from listCalls).
  const seenCallers = new Set<string>();
  for (const c of callsPage.items) {
    const key = c.callerName.trim().toLowerCase();
    if (!key || seenCallers.has(key)) continue;
    seenCallers.add(key);
    const durationLabel = formatCallDuration(c.durationSeconds);
    const startedLabel = c.startedAt
      ? new Date(c.startedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;
    entities.push(
      entity({
        id: c.id,
        type: "call",
        name: c.callerName,
        label: "Call",
        path: "/dashboard/calls",
        aliases: [
          c.callerPhone,
          maskPhone(c.callerPhone) ?? "",
          `${c.callerName} call`,
          c.callerEmail ?? "",
        ].filter(Boolean),
        fields: {
          callerName: c.callerName,
          status: callStatusLabel(c.status),
          rawStatus: c.status,
          disposition: c.disposition,
          agentName: c.agentName,
          durationSeconds: c.durationSeconds,
          durationLabel,
          startedAt: c.startedAt,
          startedLabel,
          callerPhone: maskPhone(c.callerPhone),
          businessPhone: maskPhone(c.phoneNumber),
          direction: c.direction,
          description: [
            `${c.callerName}'s call was ${callStatusLabel(c.status)}`,
            c.agentName ? `by ${c.agentName}` : null,
            startedLabel ? `on ${startedLabel}` : null,
            durationLabel ? `lasting ${durationLabel}` : null,
            c.disposition ? `(${c.disposition})` : null,
          ]
            .filter(Boolean)
            .join(" "),
        },
      }),
    );
  }

  const seenAppt = new Set<string>();
  for (const a of appointmentsPage.items) {
    const key = a.contactName.trim().toLowerCase();
    if (!key || seenAppt.has(key)) continue;
    seenAppt.add(key);
    const startsLabel = new Date(a.startsAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    entities.push(
      entity({
        id: a.id,
        type: "appointment",
        name: a.contactName,
        label: "Appointment",
        path: "/dashboard/appointments",
        aliases: [a.serviceName, a.providerName, `${a.contactName} appointment`],
        fields: {
          contactName: a.contactName,
          serviceName: a.serviceName,
          providerName: a.providerName,
          status: a.status,
          startsAt: a.startsAt,
          startsLabel,
          contactPhone: maskPhone(a.contactPhone),
          description: `${a.contactName} — ${a.serviceName} with ${a.providerName} on ${startsLabel} (${a.status})`,
        },
      }),
    );
  }

  for (const m of teamMembers) {
    entities.push(
      entity({
        id: m.id,
        type: "team_member",
        name: m.fullName,
        label: "Team Member",
        path: "/dashboard/team",
        aliases: [m.role, m.department, m.email],
        fields: {
          role: m.role,
          department: m.department,
          status: m.status,
          phone: maskPhone(m.phone),
          email: m.email,
          description: `${m.fullName} is a ${m.role} on the ${m.department} team (${m.status}).`,
        },
      }),
    );
  }

  for (const q of queues) {
    entities.push(
      entity({
        id: q.id,
        type: "call_queue",
        name: q.name,
        label: "Call Queue",
        path: "/dashboard/call-queues",
        aliases: [q.queueType, `${q.name} queue`],
        fields: {
          avgWait: q.avgWaitLabel,
          avgWaitLabel: q.avgWaitLabel,
          longestWait: q.longestWaitLabel,
          longestWaitLabel: q.longestWaitLabel,
          callsInQueue: q.callsInQueue,
          agentsOnline: q.agentsOnline,
          agentsTotal: q.agentsTotal,
          abandoned: q.abandoned,
          abandonedRate: q.abandonedRate,
          serviceLevel: q.serviceLevel,
          status: q.status,
          strategy: q.strategy,
          queueType: q.queueType,
        },
      }),
    );
  }

  for (const e of employees) {
    const caps = e.capabilities.join("; ");
    entities.push(
      entity({
        id: e.id,
        type: "ai_employee",
        name: e.name,
        label: "AI Employee",
        path: `/dashboard/ai-employees/${e.id}`,
        aliases: [e.roleTitle, e.department, ...e.tags, e.name.split(" - ")[0] ?? ""].filter(
          Boolean,
        ),
        fields: {
          roleTitle: e.roleTitle,
          department: e.department,
          lifecycleStatus: e.lifecycleStatus,
          language: e.language,
          voice: e.voice,
          description: e.description,
          personality: e.personality,
          tags: e.tags.join(", "),
          capabilities: caps || null,
          performanceScore: e.performanceScore,
          status: e.lifecycleStatus,
          highlights: [
            e.description,
            e.roleTitle ? `Role: ${e.roleTitle}` : null,
            e.department ? `Department: ${e.department}` : null,
            e.personality ? `Personality: ${e.personality}` : null,
            caps ? `Capabilities: ${caps}` : null,
            e.tags.length ? `Tags: ${e.tags.join(", ")}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        },
      }),
    );
  }

  for (const m of marketplace) {
    entities.push(
      entity({
        id: m.id,
        type: "marketplace_agent",
        name: m.name,
        label: "Marketplace Agent",
        path: "/dashboard/marketplace",
        aliases: [m.category, m.name.replace(/\s+bot$/i, ""), "bot"],
        fields: {
          category: m.category,
          description: m.description,
          installs: m.installs,
          rating: m.rating,
          priceLabel: m.priceLabel,
        },
      }),
    );
  }

  for (const t of trainings) {
    entities.push(
      entity({
        id: t.id,
        type: "training_job",
        name: t.name,
        label: "Training Job",
        path: "/dashboard/training",
        aliases: [t.agentName, t.datasetName, `${t.name} training`],
        fields: {
          agentName: t.agentName,
          datasetName: t.datasetName,
          source: t.source,
          accuracy: t.accuracy,
          status: t.status,
          lastTrainedAt: t.lastTrainedAt,
        },
      }),
    );
  }

  for (const i of integrations) {
    entities.push(
      entity({
        id: i.id,
        type: "integration",
        name: i.name,
        label: "Integration",
        path: "/dashboard/integrations",
        // Prefer product key/name only — generic categories like "Automation"
        // collide with feature phrases ("WhatsApp Automation").
        aliases: [i.key].filter(Boolean),
        fields: {
          status: i.status,
          category: i.category,
          lastSync: i.lastSync,
          description: i.description,
        },
      }),
    );
  }

  for (const l of locations) {
    entities.push(
      entity({
        id: l.id,
        type: "location",
        name: l.name,
        label: "Location",
        path: "/dashboard/locations",
        aliases: [l.city, l.region, `${l.city} ${l.region}`],
        fields: {
          city: l.city,
          region: l.region,
          status: l.status,
          phone: maskPhone(l.phone),
          teamCount: l.teamCount,
          callsThisMonth: l.callsThisMonth,
          appointmentsThisMonth: l.appointmentsThisMonth,
          isPrimary: l.isPrimary,
        },
      }),
    );
  }

  for (const p of phones) {
    entities.push(
      entity({
        id: p.id,
        type: "phone_number",
        name: p.friendlyName,
        label: "Phone Number",
        path: "/dashboard/phone-numbers",
        aliases: [p.e164, maskPhone(p.e164) ?? "", p.assignedTo ?? ""].filter(Boolean),
        fields: {
          e164: maskPhone(p.e164),
          status: p.status,
          assignedTo: p.assignedTo,
          location: p.location,
          numberType: p.numberType,
        },
      }),
    );
  }

  for (const d of crm) {
    entities.push(
      entity({
        id: d.id,
        type: "crm_deal",
        name: d.title,
        label: "CRM Deal",
        path: "/dashboard/crm",
        aliases: [d.contactName, d.interest],
        fields: {
          contactName: d.contactName,
          stage: d.stage,
          valueCents: d.valueCents,
          source: d.source,
          ownerName: d.ownerName,
          interest: d.interest,
        },
      }),
    );
  }

  for (const doc of knowledge) {
    entities.push(
      entity({
        id: doc.id,
        type: "knowledge_doc",
        name: doc.title,
        label: "Knowledge Document",
        path: "/dashboard/knowledge-base",
        aliases: [doc.category ?? ""],
        fields: {
          status: doc.status,
          category: doc.category ?? null,
          mimeType: doc.mimeType ?? null,
        },
      }),
    );
  }

  for (const w of workflows) {
    const steps = (w.graph?.nodes ?? [])
      .map((n) => n.title)
      .filter(Boolean)
      .slice(0, 6)
      .join(" → ");
    entities.push(
      entity({
        id: w.id,
        type: "workflow",
        name: w.name,
        label: "Workflow",
        path: "/dashboard/workflows",
        aliases: [w.status, `${w.name} workflow`],
        fields: {
          status: w.status,
          runs: w.runs,
          description: w.description,
          steps: steps || null,
          lastRunAt: w.lastRunAt,
          updatedAt: w.updatedAt,
        },
      }),
    );
  }

  for (const v of voiceFlows) {
    entities.push(
      entity({
        id: v.id,
        type: "voice_flow",
        name: v.name,
        label: "Voice Flow",
        path: "/dashboard/voice-flows",
        aliases: [v.agentName],
        fields: {
          status: v.status,
          agentName: v.agentName,
          description: v.description,
        },
      }),
    );
  }

  for (const r of routing) {
    entities.push(
      entity({
        id: r.id,
        type: "routing_rule",
        name: r.name,
        label: "Routing Rule",
        path: "/dashboard/routing-rules",
        aliases: [r.description],
        fields: {
          status: r.status,
          priority: r.priority,
          description: r.description,
        },
      }),
    );
  }

  for (const c of whatsapp.conversations) {
    entities.push(
      entity({
        id: c.id,
        type: "whatsapp_conversation",
        name: c.contactName,
        label: "WhatsApp Conversation",
        path: "/dashboard/whatsapp",
        aliases: [c.interest, c.workflowName],
        fields: {
          phone: c.phone,
          interest: c.interest,
          status: c.status,
          workflowName: c.workflowName,
          lastMessage: c.lastMessage,
          relativeTime: c.relativeTime,
        },
      }),
    );
  }

  for (const w of whatsapp.workflows) {
    entities.push(
      entity({
        id: `wa-wf-${w.name}`,
        type: "whatsapp_workflow",
        name: w.name,
        label: "WhatsApp Workflow",
        path: "/dashboard/whatsapp",
        aliases: [],
        fields: {
          volume: w.volume,
          pct: w.pct,
        },
      }),
    );
  }

  for (const inv of invoices) {
    entities.push(
      entity({
        id: inv.id,
        type: "invoice",
        name: inv.number,
        label: "Invoice",
        path: "/dashboard/billing",
        aliases: [inv.periodLabel],
        fields: {
          status: inv.status,
          amountUsd: inv.amountUsd,
          periodLabel: inv.periodLabel,
          issuedAt: inv.issuedAt,
        },
      }),
    );
  }

  return entities;
}
