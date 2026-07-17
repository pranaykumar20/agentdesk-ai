import type { OrgContext } from "@/lib/auth";
import { can, type Resource } from "@/lib/permissions";
import { getExactDashboardMetrics } from "@/modules/analytics/exact-metrics";
import { getAiEmployeeMetrics, listAiEmployees } from "@/modules/agents/data";
import {
  getAppointmentMetrics,
  getUpcomingAppointments,
  listAppointments,
} from "@/modules/appointments/data";
import { getUsageSnapshot } from "@/modules/billing/data";
import { getCallQueueSummary } from "@/modules/call-queues/data";
import { listCalls, getRecentCalls } from "@/modules/calls/data";
import { getContactCenterSummary } from "@/modules/contact-center/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { getIntegrationMetrics, listIntegrations } from "@/modules/integrations/data";
import { getKnowledgeMetrics } from "@/modules/knowledge/data";
import { getLiveMonitorSummary } from "@/modules/live-monitor/data";
import { getLocationMetrics, listLocations } from "@/modules/locations/data";
import { getPhoneMetrics, listPhoneNumbers } from "@/modules/phone-numbers/data";
import { getRoiSummary } from "@/modules/roi/data";
import { getGeneralSettings } from "@/modules/settings/data";
import { getSmsCampaignSummary } from "@/modules/sms-campaigns/data";
import { getTeamMetrics, listTeamMembers } from "@/modules/team/data";
import { getTrainingSummary } from "@/modules/training/data";
import { getVoiceFlowMetrics } from "@/modules/voice-flows/data";
import { getWhatsappSummary } from "@/modules/whatsapp/data";
import { getWorkflowMetrics } from "@/modules/workflows/data";

const SNAPSHOT_RESOURCES = [
  "organization",
  "calls",
  "appointments",
  "crm",
  "agents",
  "phone_numbers",
  "members",
  "locations",
  "integrations",
  "knowledge",
  "workflows",
  "voice_flows",
  "billing",
  "analytics",
  "contact_center",
  "live_monitor",
  "call_queues",
  "sms_campaigns",
  "whatsapp",
  "training",
  "roi",
  "settings",
] as const satisfies readonly Resource[];

export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-***-${digits.slice(-4)}`;
}

async function settled<T>(promise: Promise<T>): Promise<T | { error: string }> {
  try {
    return await promise;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to load" };
  }
}

function isErrorResult(value: unknown): value is { error: string } {
  return Boolean(value && typeof value === "object" && "error" in value);
}

/**
 * Builds a permission-filtered, org-scoped account snapshot for Ava.
 * Organization id always comes from server OrgContext — never from the client.
 */
export async function buildAccountSnapshot(ctx: OrgContext) {
  const organizationId = ctx.organization.id;
  const role = ctx.role;
  const allowed = (resource: Resource) => can(role, "read", resource);
  const denied = SNAPSHOT_RESOURCES.filter((resource) => !allowed(resource));

  const [
    dashboard,
    callList,
    recentCalls,
    apptMetrics,
    upcomingAppts,
    recentAppts,
    crm,
    agentMetrics,
    agents,
    phoneMetrics,
    phones,
    teamMetrics,
    members,
    locationMetrics,
    locations,
    integrationMetrics,
    integrations,
    knowledge,
    workflows,
    voiceFlows,
    billing,
    contactCenter,
    liveMonitor,
    callQueues,
    sms,
    whatsapp,
    training,
    roi,
  ] = await Promise.all([
    allowed("analytics") || allowed("calls")
      ? settled(getExactDashboardMetrics(organizationId))
      : Promise.resolve(null),
    allowed("calls")
      ? settled(listCalls(organizationId, { page: 1, pageSize: 100 }))
      : Promise.resolve(null),
    allowed("calls") ? settled(getRecentCalls(organizationId, 5)) : Promise.resolve(null),
    allowed("appointments")
      ? settled(getAppointmentMetrics(organizationId))
      : Promise.resolve(null),
    allowed("appointments")
      ? settled(getUpcomingAppointments(organizationId, 5))
      : Promise.resolve(null),
    allowed("appointments")
      ? settled(listAppointments(organizationId, { page: 1, pageSize: 5 }))
      : Promise.resolve(null),
    allowed("crm") ? settled(getCrmPipelineSummary(organizationId)) : Promise.resolve(null),
    allowed("agents") ? settled(getAiEmployeeMetrics(organizationId)) : Promise.resolve(null),
    allowed("agents") ? settled(listAiEmployees(organizationId)) : Promise.resolve(null),
    allowed("phone_numbers")
      ? settled(getPhoneMetrics(organizationId))
      : Promise.resolve(null),
    allowed("phone_numbers")
      ? settled(listPhoneNumbers(organizationId))
      : Promise.resolve(null),
    allowed("members") ? settled(getTeamMetrics(organizationId)) : Promise.resolve(null),
    allowed("members") ? settled(listTeamMembers(organizationId)) : Promise.resolve(null),
    allowed("locations")
      ? settled(getLocationMetrics(organizationId))
      : Promise.resolve(null),
    allowed("locations") ? settled(listLocations(organizationId)) : Promise.resolve(null),
    allowed("integrations")
      ? settled(getIntegrationMetrics(organizationId))
      : Promise.resolve(null),
    allowed("integrations")
      ? settled(listIntegrations(organizationId))
      : Promise.resolve(null),
    allowed("knowledge")
      ? settled(getKnowledgeMetrics(organizationId))
      : Promise.resolve(null),
    allowed("workflows")
      ? settled(getWorkflowMetrics(organizationId))
      : Promise.resolve(null),
    allowed("voice_flows")
      ? settled(getVoiceFlowMetrics(organizationId))
      : Promise.resolve(null),
    allowed("billing") ? settled(getUsageSnapshot(organizationId)) : Promise.resolve(null),
    allowed("contact_center")
      ? settled(getContactCenterSummary(organizationId))
      : Promise.resolve(null),
    allowed("live_monitor")
      ? settled(getLiveMonitorSummary(organizationId))
      : Promise.resolve(null),
    allowed("call_queues")
      ? settled(getCallQueueSummary(organizationId))
      : Promise.resolve(null),
    allowed("sms_campaigns")
      ? settled(getSmsCampaignSummary(organizationId))
      : Promise.resolve(null),
    allowed("whatsapp") ? settled(getWhatsappSummary(organizationId)) : Promise.resolve(null),
    allowed("training") ? settled(getTrainingSummary(organizationId)) : Promise.resolve(null),
    allowed("roi") ? settled(getRoiSummary(organizationId)) : Promise.resolve(null),
  ]);

  const settings = allowed("settings") || allowed("organization")
    ? getGeneralSettings(ctx.organization)
    : null;

  const callItems = !isErrorResult(callList) && callList ? callList.items : [];
  const answeredFromList = callItems.filter((c) => c.status === "completed").length;
  const missedFromList = callItems.filter(
    (c) => c.status === "missed" || c.status === "no_answer",
  ).length;
  const voicemailFromList = callItems.filter((c) => c.status === "voicemail").length;

  return {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    organization: {
      id: organizationId,
      name: ctx.organization.name,
      slug: ctx.organization.slug,
      industry: ctx.organization.industry,
      timezone: ctx.organization.timezone,
      onboardingCompleted: Boolean(ctx.organization.onboarding_completed_at),
    },
    viewer: {
      role,
      deniedResources: denied,
    },
    settings: settings
      ? {
          businessName: settings.businessName,
          businessPhone: maskPhone(settings.businessPhone),
          website: settings.website,
          industry: settings.industry,
          timezone: settings.timezone,
          currency: settings.currency,
          language: settings.language,
        }
      : { denied: true },
    dashboard:
      !isErrorResult(dashboard) && dashboard
        ? {
            metricsSource: dashboard.metricsSource,
            totalCalls: dashboard.totalCalls,
            answeredCalls: dashboard.answeredCalls,
            missedCalls: dashboard.missedCalls,
            voicemails: dashboard.voicemails,
            appointmentsBooked: dashboard.appointmentsBooked,
            newLeads: dashboard.newLeads,
            answerRate: dashboard.answerRate,
            avgDurationSeconds: dashboard.avgDurationSeconds,
            aiResolutionRate: dashboard.aiResolutionRate,
            topReasons: dashboard.topReasons,
            path: "/dashboard",
          }
        : denied.includes("analytics") && denied.includes("calls")
          ? { denied: true }
          : isErrorResult(dashboard)
            ? { error: dashboard.error }
            : null,
    calls: !isErrorResult(callList) && callList
      ? {
          total: callList.total,
          sampleAnswered: answeredFromList,
          sampleMissed: missedFromList,
          sampleVoicemail: voicemailFromList,
          recent:
            !isErrorResult(recentCalls) && recentCalls
              ? recentCalls.map((c) => ({
                  id: c.id,
                  callerName: c.callerName,
                  callerPhone: maskPhone(c.callerPhone),
                  status: c.status,
                  disposition: c.disposition,
                  direction: c.direction,
                  durationSeconds: c.durationSeconds,
                  startedAt: c.startedAt,
                  agentName: c.agentName,
                }))
              : [],
          path: "/dashboard/calls",
        }
      : denied.includes("calls")
        ? { denied: true }
        : isErrorResult(callList)
          ? { error: callList.error }
          : null,
    appointments:
      !isErrorResult(apptMetrics) && apptMetrics
        ? {
            metrics: apptMetrics,
            upcoming:
              !isErrorResult(upcomingAppts) && upcomingAppts
                ? upcomingAppts.map((a) => ({
                    contactName: a.contactName,
                    contactPhone: maskPhone(a.contactPhone),
                    serviceName: a.serviceName,
                    providerName: a.providerName,
                    status: a.status,
                    startsAt: a.startsAt,
                  }))
                : [],
            recent:
              !isErrorResult(recentAppts) && recentAppts
                ? recentAppts.items.map((a) => ({
                    contactName: a.contactName,
                    serviceName: a.serviceName,
                    status: a.status,
                    startsAt: a.startsAt,
                  }))
                : [],
            path: "/dashboard/appointments",
          }
        : denied.includes("appointments")
          ? { denied: true }
          : isErrorResult(apptMetrics)
            ? { error: apptMetrics.error }
            : null,
    crm:
      !isErrorResult(crm) && crm
        ? {
            totalDeals: crm.totalDeals,
            totalValueCents: crm.totalValueCents,
            byStage: crm.byStage.map((s) => ({
              id: s.id,
              label: s.label,
              count: s.count,
              valueCents: s.valueCents,
            })),
            sources: crm.sources,
            recentDeals: crm.deals.slice(0, 5).map((d) => ({
              title: d.title,
              stage: d.stage,
              valueCents: d.valueCents,
              source: d.source,
              contactName: d.contactName,
            })),
            path: "/dashboard/crm",
          }
        : denied.includes("crm")
          ? { denied: true }
          : isErrorResult(crm)
            ? { error: crm.error }
            : null,
    aiEmployees:
      !isErrorResult(agentMetrics) && agentMetrics
        ? {
            metrics: agentMetrics,
            employees:
              !isErrorResult(agents) && agents
                ? agents.map((a) => ({
                    name: a.name,
                    roleTitle: a.roleTitle,
                    department: a.department,
                    lifecycleStatus: a.lifecycleStatus,
                    performanceScore: a.performanceScore,
                    language: a.language,
                  }))
                : [],
            path: "/dashboard/ai-employees",
          }
        : denied.includes("agents")
          ? { denied: true }
          : isErrorResult(agentMetrics)
            ? { error: agentMetrics.error }
            : null,
    phoneNumbers:
      !isErrorResult(phoneMetrics) && phoneMetrics
        ? {
            metrics: phoneMetrics,
            numbers:
              !isErrorResult(phones) && phones
                ? phones.map((p) => ({
                    e164: maskPhone(p.e164),
                    friendlyName: p.friendlyName,
                    status: p.status,
                    assignedTo: p.assignedTo,
                    location: p.location,
                  }))
                : [],
            path: "/dashboard/phone-numbers",
          }
        : denied.includes("phone_numbers")
          ? { denied: true }
          : isErrorResult(phoneMetrics)
            ? { error: phoneMetrics.error }
            : null,
    team:
      !isErrorResult(teamMetrics) && teamMetrics
        ? {
            metrics: teamMetrics,
            members:
              !isErrorResult(members) && members
                ? members.slice(0, 20).map((m) => ({
                    fullName: m.fullName,
                    role: m.role,
                    department: m.department,
                    status: m.status,
                    // Emails omitted by default — use list_team_members tool with includeEmails.
                  }))
                : [],
            path: "/dashboard/team",
          }
        : denied.includes("members")
          ? { denied: true }
          : isErrorResult(teamMetrics)
            ? { error: teamMetrics.error }
            : null,
    locations:
      !isErrorResult(locationMetrics) && locationMetrics
        ? {
            metrics: locationMetrics,
            items:
              !isErrorResult(locations) && locations
                ? locations.map((l) => ({
                    name: l.name,
                    city: l.city,
                    region: l.region,
                    status: l.status,
                    isPrimary: l.isPrimary,
                    phone: maskPhone(l.phone),
                  }))
                : [],
            path: "/dashboard/locations",
          }
        : denied.includes("locations")
          ? { denied: true }
          : isErrorResult(locationMetrics)
            ? { error: locationMetrics.error }
            : null,
    integrations:
      !isErrorResult(integrationMetrics) && integrationMetrics
        ? {
            metrics: integrationMetrics,
            items:
              !isErrorResult(integrations) && integrations
                ? integrations.map((i) => ({
                    name: i.name,
                    category: i.category,
                    status: i.status,
                    lastSync: i.lastSync,
                  }))
                : [],
            path: "/dashboard/integrations",
          }
        : denied.includes("integrations")
          ? { denied: true }
          : isErrorResult(integrationMetrics)
            ? { error: integrationMetrics.error }
            : null,
    knowledge:
      !isErrorResult(knowledge) && knowledge
        ? { ...knowledge, path: "/dashboard/knowledge-base" }
        : denied.includes("knowledge")
          ? { denied: true }
          : isErrorResult(knowledge)
            ? { error: knowledge.error }
            : null,
    workflows:
      !isErrorResult(workflows) && workflows
        ? { ...workflows, path: "/dashboard/workflows" }
        : denied.includes("workflows")
          ? { denied: true }
          : isErrorResult(workflows)
            ? { error: workflows.error }
            : null,
    voiceFlows:
      !isErrorResult(voiceFlows) && voiceFlows
        ? { ...voiceFlows, path: "/dashboard/voice-flows" }
        : denied.includes("voice_flows")
          ? { denied: true }
          : isErrorResult(voiceFlows)
            ? { error: voiceFlows.error }
            : null,
    billing:
      !isErrorResult(billing) && billing
        ? {
            planName: billing.planName,
            planKey: billing.planKey,
            status: billing.status,
            minutesUsed: billing.minutesUsed,
            minutesIncluded: billing.minutesIncluded,
            usagePct: billing.usagePct,
            overageMinutes: billing.overageMinutes,
            estimatedOverageUsd: billing.estimatedOverageUsd,
            path: "/dashboard/billing",
          }
        : denied.includes("billing")
          ? { denied: true }
          : isErrorResult(billing)
            ? { error: billing.error }
            : null,
    contactCenter:
      !isErrorResult(contactCenter) && contactCenter
        ? { ...contactCenter, path: "/dashboard/contact-center" }
        : denied.includes("contact_center")
          ? { denied: true }
          : isErrorResult(contactCenter)
            ? { error: contactCenter.error }
            : null,
    liveMonitor:
      !isErrorResult(liveMonitor) && liveMonitor
        ? { ...liveMonitor, path: "/dashboard/live-monitor" }
        : denied.includes("live_monitor")
          ? { denied: true }
          : isErrorResult(liveMonitor)
            ? { error: liveMonitor.error }
            : null,
    callQueues:
      !isErrorResult(callQueues) && callQueues
        ? { ...callQueues, path: "/dashboard/call-queues" }
        : denied.includes("call_queues")
          ? { denied: true }
          : isErrorResult(callQueues)
            ? { error: callQueues.error }
            : null,
    smsCampaigns:
      !isErrorResult(sms) && sms
        ? { ...sms, path: "/dashboard/sms-campaigns" }
        : denied.includes("sms_campaigns")
          ? { denied: true }
          : isErrorResult(sms)
            ? { error: sms.error }
            : null,
    whatsapp:
      !isErrorResult(whatsapp) && whatsapp
        ? { ...whatsapp, path: "/dashboard/whatsapp" }
        : denied.includes("whatsapp")
          ? { denied: true }
          : isErrorResult(whatsapp)
            ? { error: whatsapp.error }
            : null,
    training:
      !isErrorResult(training) && training
        ? { ...training, path: "/dashboard/training" }
        : denied.includes("training")
          ? { denied: true }
          : isErrorResult(training)
            ? { error: training.error }
            : null,
    roi:
      !isErrorResult(roi) && roi
        ? {
            metrics: roi.metrics,
            insights: roi.insights.slice(0, 5),
            path: "/dashboard/revenue",
          }
        : denied.includes("roi")
          ? { denied: true }
          : isErrorResult(roi)
            ? { error: roi.error }
            : null,
    dashboardPaths: {
      home: "/dashboard",
      calls: "/dashboard/calls",
      appointments: "/dashboard/appointments",
      crm: "/dashboard/crm",
      aiEmployees: "/dashboard/ai-employees",
      phoneNumbers: "/dashboard/phone-numbers",
      team: "/dashboard/team",
      locations: "/dashboard/locations",
      integrations: "/dashboard/integrations",
      knowledge: "/dashboard/knowledge-base",
      workflows: "/dashboard/workflows",
      voiceFlows: "/dashboard/voice-flows",
      billing: "/dashboard/billing",
      analytics: "/dashboard/analytics",
      contactCenter: "/dashboard/contact-center",
      liveMonitor: "/dashboard/live-monitor",
      settings: "/dashboard/settings",
    },
  };
}

export type AccountSnapshot = Awaited<ReturnType<typeof buildAccountSnapshot>>;

export function serializeAccountSnapshot(snapshot: AccountSnapshot): string {
  return JSON.stringify(snapshot);
}
