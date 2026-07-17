import type { OrgContext } from "@/lib/auth";
import { can, type UserRole } from "@/lib/permissions";
import { getExactDashboardMetrics } from "@/modules/analytics/exact-metrics";
import { getAiEmployeeMetrics, listAiEmployees } from "@/modules/agents/data";
import {
  getAppointmentMetrics,
  getUpcomingAppointments,
  listAppointments,
} from "@/modules/appointments/data";
import { getUsageSnapshot } from "@/modules/billing/data";
import { listCalls } from "@/modules/calls/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { getIntegrationMetrics, listIntegrations } from "@/modules/integrations/data";
import { getKnowledgeMetrics } from "@/modules/knowledge/data";
import { listTeamMembers, getTeamMetrics } from "@/modules/team/data";
import { maskPhone } from "./account-context";
import type { AvaCitation } from "./citations";
import type { ProposedAction } from "./actions";
import { createProposedAction } from "./actions";

export type ToolExecutionResult = {
  name: string;
  ok: boolean;
  data?: unknown;
  error?: string;
  citations: AvaCitation[];
  proposedAction?: ProposedAction;
};

type ToolArgs = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown): boolean {
  return value === true;
}

export const AVA_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_dashboard_metrics",
      description: "Exact dashboard KPIs (total calls, answered, appointments, leads, etc.).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_recent_calls",
      description: "List recent calls with optional tab filter (all|answered|missed|voicemails).",
      parameters: {
        type: "object",
        properties: {
          tab: { type: "string", enum: ["all", "answered", "missed", "voicemails"] },
          limit: { type: "integer", minimum: 1, maximum: 20 },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_billing_usage",
      description: "Plan name and minutes used/included.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_ai_employees",
      description: "List AI employees and lifecycle status.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_appointments",
      description: "Upcoming or recent appointments.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 20 },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_crm_summary",
      description: "CRM pipeline totals and stage counts.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_team_members",
      description:
        "Team members (name/role/status). Set includeEmails=true only if the user explicitly asked for emails.",
      parameters: {
        type: "object",
        properties: {
          includeEmails: { type: "boolean" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_integrations",
      description: "Integration connection status (never returns secrets).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_knowledge_metrics",
      description: "Knowledge base document counts.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "propose_invite_team_member",
      description:
        "Propose inviting a teammate. Does NOT invite until the user confirms in the UI.",
      parameters: {
        type: "object",
        required: ["fullName", "email", "role"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["ADMIN", "MANAGER", "AGENT", "VIEWER"] },
          department: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "propose_pause_ai_employee",
      description:
        "Propose pausing/archiving an AI employee. Does NOT change state until user confirms.",
      parameters: {
        type: "object",
        required: ["employeeId"],
        properties: {
          employeeId: { type: "string" },
          employeeName: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "propose_set_integration_status",
      description:
        "Propose connecting or disconnecting an integration. Requires user confirmation.",
      parameters: {
        type: "object",
        required: ["integrationId", "status"],
        properties: {
          integrationId: { type: "string" },
          integrationName: { type: "string" },
          status: { type: "string", enum: ["connected", "disconnected"] },
        },
        additionalProperties: false,
      },
    },
  },
];

function deny(name: string, resource: string): ToolExecutionResult {
  return {
    name,
    ok: false,
    error: `Permission denied: cannot read ${resource}`,
    citations: [],
  };
}

export async function executeAvaTool(
  ctx: OrgContext,
  name: string,
  rawArgs: ToolArgs = {},
): Promise<ToolExecutionResult> {
  const orgId = ctx.organization.id;
  const role = ctx.role;

  switch (name) {
    case "get_dashboard_metrics": {
      if (!can(role, "read", "analytics") && !can(role, "read", "calls")) {
        return deny(name, "analytics");
      }
      const metrics = await getExactDashboardMetrics(orgId);
      return {
        name,
        ok: true,
        data: metrics,
        citations: [{ label: "Dashboard", path: "/dashboard", tool: name }],
      };
    }
    case "list_recent_calls": {
      if (!can(role, "read", "calls")) return deny(name, "calls");
      const tab = asString(rawArgs.tab, "all") as "all" | "answered" | "missed" | "voicemails";
      const limit = Math.min(20, Math.max(1, asNumber(rawArgs.limit, 8)));
      const result = await listCalls(orgId, {
        tab: tab === "all" ? "all" : tab,
        page: 1,
        pageSize: limit,
      });
      return {
        name,
        ok: true,
        data: {
          total: result.total,
          items: result.items.map((c) => ({
            id: c.id,
            callerName: c.callerName,
            callerPhone: maskPhone(c.callerPhone),
            status: c.status,
            disposition: c.disposition,
            startedAt: c.startedAt,
            durationSeconds: c.durationSeconds,
          })),
        },
        citations: [{ label: "Calls", path: "/dashboard/calls", tool: name }],
      };
    }
    case "get_billing_usage": {
      if (!can(role, "read", "billing")) return deny(name, "billing");
      const usage = await getUsageSnapshot(orgId);
      return {
        name,
        ok: true,
        data: usage,
        citations: [{ label: "Billing", path: "/dashboard/billing", tool: name }],
      };
    }
    case "list_ai_employees": {
      if (!can(role, "read", "agents")) return deny(name, "agents");
      const [metrics, employees] = await Promise.all([
        getAiEmployeeMetrics(orgId),
        listAiEmployees(orgId),
      ]);
      return {
        name,
        ok: true,
        data: { metrics, employees },
        citations: [{ label: "AI Employees", path: "/dashboard/ai-employees", tool: name }],
      };
    }
    case "list_appointments": {
      if (!can(role, "read", "appointments")) return deny(name, "appointments");
      const limit = Math.min(20, Math.max(1, asNumber(rawArgs.limit, 5)));
      const [metrics, upcoming, recent] = await Promise.all([
        getAppointmentMetrics(orgId),
        getUpcomingAppointments(orgId, limit),
        listAppointments(orgId, { page: 1, pageSize: limit }),
      ]);
      return {
        name,
        ok: true,
        data: {
          metrics,
          upcoming: upcoming.map((a) => ({
            contactName: a.contactName,
            contactPhone: maskPhone(a.contactPhone),
            serviceName: a.serviceName,
            status: a.status,
            startsAt: a.startsAt,
          })),
          recent: recent.items.map((a) => ({
            contactName: a.contactName,
            serviceName: a.serviceName,
            status: a.status,
            startsAt: a.startsAt,
          })),
        },
        citations: [{ label: "Appointments", path: "/dashboard/appointments", tool: name }],
      };
    }
    case "get_crm_summary": {
      if (!can(role, "read", "crm")) return deny(name, "crm");
      const crm = await getCrmPipelineSummary(orgId);
      return {
        name,
        ok: true,
        data: {
          totalDeals: crm.totalDeals,
          totalValueCents: crm.totalValueCents,
          byStage: crm.byStage.map((s) => ({
            id: s.id,
            label: s.label,
            count: s.count,
            valueCents: s.valueCents,
          })),
          sources: crm.sources,
        },
        citations: [{ label: "CRM", path: "/dashboard/crm", tool: name }],
      };
    }
    case "list_team_members": {
      if (!can(role, "read", "members")) return deny(name, "members");
      const includeEmails = asBool(rawArgs.includeEmails);
      const [metrics, members] = await Promise.all([
        getTeamMetrics(orgId),
        listTeamMembers(orgId),
      ]);
      return {
        name,
        ok: true,
        data: {
          metrics,
          members: members.map((m) => ({
            id: m.id,
            fullName: m.fullName,
            role: m.role,
            department: m.department,
            status: m.status,
            ...(includeEmails ? { email: m.email } : {}),
          })),
          emailsIncluded: includeEmails,
        },
        citations: [{ label: "Team", path: "/dashboard/team", tool: name }],
      };
    }
    case "list_integrations": {
      if (!can(role, "read", "integrations")) return deny(name, "integrations");
      const [metrics, items] = await Promise.all([
        getIntegrationMetrics(orgId),
        listIntegrations(orgId),
      ]);
      return {
        name,
        ok: true,
        data: {
          metrics,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            status: i.status,
            lastSync: i.lastSync,
          })),
        },
        citations: [{ label: "Integrations", path: "/dashboard/integrations", tool: name }],
      };
    }
    case "get_knowledge_metrics": {
      if (!can(role, "read", "knowledge")) return deny(name, "knowledge");
      const metrics = await getKnowledgeMetrics(orgId);
      return {
        name,
        ok: true,
        data: metrics,
        citations: [{ label: "Knowledge Base", path: "/dashboard/knowledge-base", tool: name }],
      };
    }
    case "propose_invite_team_member": {
      if (!can(role, "invite", "members")) {
        return { name, ok: false, error: "Permission denied: cannot invite members", citations: [] };
      }
      const fullName = asString(rawArgs.fullName).trim();
      const email = asString(rawArgs.email).trim().toLowerCase();
      const memberRole = asString(rawArgs.role, "AGENT") as UserRole;
      const department = asString(rawArgs.department, "General").trim() || "General";
      if (!fullName || !email.includes("@")) {
        return { name, ok: false, error: "fullName and valid email are required", citations: [] };
      }
      const proposedAction = createProposedAction(ctx, {
        type: "invite_team_member",
        summary: `Invite ${fullName} (${email}) as ${memberRole}`,
        payload: { fullName, email, role: memberRole, department },
      });
      return {
        name,
        ok: true,
        data: { status: "awaiting_confirmation", proposedAction },
        citations: [{ label: "Team", path: "/dashboard/team", tool: name }],
        proposedAction,
      };
    }
    case "propose_pause_ai_employee": {
      if (!can(role, "update", "agents")) {
        return { name, ok: false, error: "Permission denied: cannot update agents", citations: [] };
      }
      const employeeId = asString(rawArgs.employeeId).trim();
      const employeeName = asString(rawArgs.employeeName, "AI employee").trim();
      if (!employeeId) {
        return { name, ok: false, error: "employeeId is required", citations: [] };
      }
      const proposedAction = createProposedAction(ctx, {
        type: "pause_ai_employee",
        summary: `Pause/archive ${employeeName}`,
        payload: { employeeId, employeeName },
      });
      return {
        name,
        ok: true,
        data: { status: "awaiting_confirmation", proposedAction },
        citations: [{ label: "AI Employees", path: "/dashboard/ai-employees", tool: name }],
        proposedAction,
      };
    }
    case "propose_set_integration_status": {
      if (!can(role, "update", "integrations") && !can(role, "manage", "integrations")) {
        return {
          name,
          ok: false,
          error: "Permission denied: cannot update integrations",
          citations: [],
        };
      }
      const integrationId = asString(rawArgs.integrationId).trim();
      const integrationName = asString(rawArgs.integrationName, "Integration").trim();
      const status = asString(rawArgs.status) as "connected" | "disconnected";
      if (!integrationId || (status !== "connected" && status !== "disconnected")) {
        return { name, ok: false, error: "integrationId and status are required", citations: [] };
      }
      const proposedAction = createProposedAction(ctx, {
        type: "set_integration_status",
        summary: `Set ${integrationName} to ${status}`,
        payload: { integrationId, integrationName, status },
      });
      return {
        name,
        ok: true,
        data: { status: "awaiting_confirmation", proposedAction },
        citations: [{ label: "Integrations", path: "/dashboard/integrations", tool: name }],
        proposedAction,
      };
    }
    default:
      return { name, ok: false, error: `Unknown tool: ${name}`, citations: [] };
  }
}
