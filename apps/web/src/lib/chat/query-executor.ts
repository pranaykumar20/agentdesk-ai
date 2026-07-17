import type { OrgContext } from "@/lib/auth";
import { can } from "@/lib/permissions/can";
import { listAppointments } from "@/modules/appointments/data";
import type { AppointmentListItem, AppointmentStatus } from "@/modules/appointments/types";
import { listCalls } from "@/modules/calls/data";
import type { CallListItem } from "@/modules/calls/types";
import { listInvoices } from "@/modules/billing/data";
import { listIntegrations } from "@/modules/integrations/data";
import { listWorkflows } from "@/modules/workflows/data";
import type { AvaCitation } from "./citations";
import type { AvaQueryPlan, AvaStatusFilter } from "./query-planner";

export type QueryExecutionResult = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  sections: NonNullable<AvaQueryPlan["section"]>[];
  /** For conversation memory */
  filterStatus?: AvaStatusFilter | AvaStatusFilter[] | null;
  queryOp?: AvaQueryPlan["op"];
  listIds?: string[];
};

function statusList(status: AvaStatusFilter | AvaStatusFilter[] | undefined): string[] {
  if (!status) return [];
  return Array.isArray(status) ? status : [status];
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isSameLocalDay(iso: string, day: "today" | "tomorrow"): boolean {
  const d = new Date(iso);
  const target = new Date();
  if (day === "tomorrow") target.setDate(target.getDate() + 1);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

function matchesAppointmentStatus(
  item: AppointmentListItem,
  statuses: string[],
): boolean {
  if (statuses.length === 0) return true;
  return statuses.includes(item.status);
}

function cite(path: string, label: string): AvaCitation {
  return { label, path, tool: "query_executor" };
}

async function executeAppointments(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (!can(ctx.role, "read", "appointments")) {
    return {
      reply: "Access to **Appointments** is restricted for your role.",
      citations: [],
      toolsUsed: ["query_executor"],
      sections: ["appointments"],
    };
  }

  const all = (await listAppointments(ctx.organization.id, { page: 1, pageSize: 100 })).items;
  const statuses = statusList(plan.filters.status);
  let items = all.filter((a) => matchesAppointmentStatus(a, statuses));

  if (plan.filters.date === "today") {
    items = items.filter((a) => isSameLocalDay(a.startsAt, "today"));
  } else if (plan.filters.date === "tomorrow") {
    items = items.filter((a) => isSameLocalDay(a.startsAt, "tomorrow"));
  }

  items = [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const path = plan.citationPath ?? "/dashboard/appointments";
  const statusLabel = statuses.includes("cancelled")
    ? "cancelled or marked no-show"
    : statuses[0]?.replace(/_/g, " ") ?? "matching";

  if (plan.op === "count") {
    return {
      reply: [
        `**${items.length}** appointment${items.length === 1 ? "" : "s"} ${
          statuses.includes("cancelled")
            ? "were cancelled or marked no-show"
            : statuses[0] === "pending"
              ? "are pending"
              : statuses[0] === "confirmed"
                ? "are confirmed"
                : `match **${statusLabel}**`
        }.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Appointments")],
      toolsUsed: ["query_executor", "section:appointments"],
      sections: ["appointments"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "count",
      listIds: items.map((i) => i.id),
    };
  }

  if (plan.op === "next") {
    const now = Date.now();
    const upcoming =
      items.find((a) => new Date(a.startsAt).getTime() >= now) ?? items[0] ?? null;
    if (!upcoming) {
      return {
        reply: [
          `There are no ${statusLabel} appointments to schedule next.`,
          "",
          `Open **${path}**.`,
        ].join("\n"),
        citations: [cite(path, "Appointments")],
        toolsUsed: ["query_executor", "section:appointments"],
        sections: ["appointments"],
        filterStatus: plan.filters.status ?? null,
        queryOp: "next",
      };
    }
    return {
      reply: [
        `The next ${statusLabel === "pending" ? "pending " : ""}appointment is **${upcoming.contactName}** — **${upcoming.serviceName}** on **${formatWhen(upcoming.startsAt)}**.`,
        "",
        `- **Status:** ${upcoming.status.replace(/_/g, " ")}`,
        `- **Provider:** ${upcoming.providerName}`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Appointments")],
      toolsUsed: ["query_executor", "section:appointments"],
      sections: ["appointments"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "next",
      listIds: [upcoming.id],
    };
  }

  // list
  const limited = items.slice(0, plan.limit || 20);
  if (limited.length === 0) {
    return {
      reply: [
        `No ${statusLabel} appointments found.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Appointments")],
      toolsUsed: ["query_executor", "section:appointments"],
      sections: ["appointments"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "list",
      listIds: [],
    };
  }

  const heading =
    statuses[0] === "pending"
      ? `You have **${items.length} pending appointment${items.length === 1 ? "" : "s"}**:`
      : statuses.includes("cancelled")
        ? `Here are the **${items.length} cancelled / no-show appointment${items.length === 1 ? "" : "s"}**:`
        : `Here are the **${items.length} ${statusLabel} appointment${items.length === 1 ? "" : "s"}**:`;

  return {
    reply: [
      heading,
      "",
      ...limited.map(
        (a, i) =>
          `${i + 1}. **${a.contactName}** — ${a.serviceName} — ${formatWhen(a.startsAt)}`,
      ),
      items.length > limited.length
        ? `\n_…and ${items.length - limited.length} more._`
        : null,
      "",
      `Open **${path}**.`,
    ]
      .filter((line) => line != null)
      .join("\n"),
    citations: [cite(path, "Appointments")],
    toolsUsed: ["query_executor", "section:appointments"],
    sections: ["appointments"],
    filterStatus: plan.filters.status ?? null,
    queryOp: "list",
    listIds: limited.map((i) => i.id),
  };
}

async function executeCalls(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (!can(ctx.role, "read", "calls")) {
    return {
      reply: "Access to **Calls** is restricted for your role.",
      citations: [],
      toolsUsed: ["query_executor"],
      sections: ["calls"],
    };
  }

  const statuses = statusList(plan.filters.status);
  const tab =
    statuses.includes("missed")
      ? "missed"
      : statuses.includes("answered")
        ? "answered"
        : statuses.includes("voicemail")
          ? "voicemails"
          : "all";

  const result = await listCalls(ctx.organization.id, {
    tab,
    page: 1,
    pageSize: 100,
  });
  let items: CallListItem[] = result.items;

  if (plan.filters.date === "today") {
    items = items.filter((c) => isSameLocalDay(c.startedAt, "today"));
  }

  const path = plan.citationPath ?? "/dashboard/calls";
  const label = statuses[0] ?? "matching";

  if (plan.op === "count") {
    return {
      reply: [
        `**${items.length}** ${label} call${items.length === 1 ? "" : "s"}${
          plan.filters.date === "today" ? " today" : ""
        }.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Calls")],
      toolsUsed: ["query_executor", "section:calls"],
      sections: ["calls"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "count",
    };
  }

  const limited = items.slice(0, plan.limit || 20);
  if (limited.length === 0) {
    return {
      reply: [`No ${label} calls found.`, "", `Open **${path}**.`].join("\n"),
      citations: [cite(path, "Calls")],
      toolsUsed: ["query_executor", "section:calls"],
      sections: ["calls"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "list",
    };
  }

  return {
    reply: [
      `Here are the **${items.length} ${label} call${items.length === 1 ? "" : "s"}**${
        plan.filters.date === "today" ? " from today" : ""
      }:`,
      "",
      ...limited.map((c, i) => {
        const dur =
          typeof c.durationSeconds === "number"
            ? ` · ${Math.floor(c.durationSeconds / 60)}:${String(c.durationSeconds % 60).padStart(2, "0")}`
            : "";
        return `${i + 1}. **${c.callerName}** — ${c.status}${dur}`;
      }),
      "",
      `Open **${path}**.`,
    ].join("\n"),
    citations: [cite(path, "Calls")],
    toolsUsed: ["query_executor", "section:calls"],
    sections: ["calls"],
    filterStatus: plan.filters.status ?? null,
    queryOp: "list",
    listIds: limited.map((c) => c.id),
  };
}

async function executeInvoices(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (!can(ctx.role, "read", "billing")) {
    return {
      reply: "Access to **Billing / Invoices** is restricted for your role.",
      citations: [],
      toolsUsed: ["query_executor"],
      sections: ["invoices"],
    };
  }

  const all = await listInvoices(ctx.organization.id);
  const statuses = statusList(plan.filters.status);
  const items = all.filter((inv) =>
    statuses.length === 0 ? true : statuses.includes(inv.status as AvaStatusFilter),
  );
  const path = "/dashboard/billing";

  if (plan.op === "count") {
    return {
      reply: [
        `**${items.length}** invoice${items.length === 1 ? "" : "s"} ${
          statuses[0] === "open" ? "are open" : `match **${statuses.join(", ") || "all"}**`
        }.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Billing")],
      toolsUsed: ["query_executor", "section:invoices"],
      sections: ["invoices"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "count",
    };
  }

  if (items.length === 0) {
    return {
      reply: [`No matching invoices.`, "", `Open **${path}**.`].join("\n"),
      citations: [cite(path, "Billing")],
      toolsUsed: ["query_executor", "section:invoices"],
      sections: ["invoices"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "list",
    };
  }

  return {
    reply: [
      `Here are the **${items.length} ${statuses[0] ?? ""} invoice${items.length === 1 ? "" : "s"}**:`.replace(
        /\s+/g,
        " ",
      ),
      "",
      ...items.slice(0, plan.limit || 20).map(
        (inv, i) =>
          `${i + 1}. **${inv.number}** — ${inv.status} — $${inv.amountUsd.toFixed(2)} (${inv.periodLabel})`,
      ),
      "",
      `Open **${path}**.`,
    ].join("\n"),
    citations: [cite(path, "Billing")],
    toolsUsed: ["query_executor", "section:invoices"],
    sections: ["invoices"],
    filterStatus: plan.filters.status ?? null,
    queryOp: "list",
  };
}

async function executeIntegrations(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (!can(ctx.role, "read", "integrations")) {
    return {
      reply: "Access to **Integrations** is restricted for your role.",
      citations: [],
      toolsUsed: ["query_executor"],
      sections: ["integrations"],
    };
  }

  const all = await listIntegrations(ctx.organization.id);
  const statuses = statusList(plan.filters.status);
  const items = all.filter((i) => {
    if (statuses.length === 0) return true;
    if (statuses.includes("disconnected")) {
      return i.status === "disconnected" || i.status === "expired";
    }
    if (statuses.includes("connected")) return i.status === "connected";
    if (statuses.includes("needs_attention")) {
      return i.status === "needs_attention" || i.status === "error";
    }
    return statuses.includes(i.status as AvaStatusFilter);
  });
  const path = "/dashboard/integrations";

  if (plan.op === "count") {
    return {
      reply: [
        `**${items.length}** integration${items.length === 1 ? "" : "s"} are **${statuses[0] ?? "matching"}**.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Integrations")],
      toolsUsed: ["query_executor", "section:integrations"],
      sections: ["integrations"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "count",
    };
  }

  if (items.length === 0) {
    return {
      reply: [`No matching integrations.`, "", `Open **${path}**.`].join("\n"),
      citations: [cite(path, "Integrations")],
      toolsUsed: ["query_executor", "section:integrations"],
      sections: ["integrations"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "list",
    };
  }

  return {
    reply: [
      `Here are the **${items.length} ${statuses[0] ?? ""} integration${items.length === 1 ? "" : "s"}**:`.replace(
        /\s+/g,
        " ",
      ),
      "",
      ...items.map((i, idx) => `${idx + 1}. **${i.name}** — ${i.status} (${i.category})`),
      "",
      `Open **${path}**.`,
    ].join("\n"),
    citations: [cite(path, "Integrations")],
    toolsUsed: ["query_executor", "section:integrations"],
    sections: ["integrations"],
    filterStatus: plan.filters.status ?? null,
    queryOp: "list",
  };
}

async function executeWorkflows(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (!can(ctx.role, "read", "workflows")) {
    return {
      reply: "Access to **Workflows** is restricted for your role.",
      citations: [],
      toolsUsed: ["query_executor"],
      sections: ["workflows"],
    };
  }

  const all = await listWorkflows(ctx.organization.id);
  const statuses = statusList(plan.filters.status);
  const items = all.filter((w) =>
    statuses.length === 0 ? true : statuses.includes(w.status as AvaStatusFilter),
  );
  const path = "/dashboard/workflows";

  if (plan.op === "count") {
    return {
      reply: [
        `**${items.length}** workflow${items.length === 1 ? "" : "s"} are **${statuses[0] ?? "matching"}**.`,
        "",
        `Open **${path}**.`,
      ].join("\n"),
      citations: [cite(path, "Workflows")],
      toolsUsed: ["query_executor", "section:workflows"],
      sections: ["workflows"],
      filterStatus: plan.filters.status ?? null,
      queryOp: "count",
    };
  }

  return {
    reply: [
      `Here are the **${items.length} ${statuses[0] ?? ""} workflow${items.length === 1 ? "" : "s"}**:`.replace(
        /\s+/g,
        " ",
      ),
      "",
      ...items.map(
        (w, i) =>
          `${i + 1}. **${w.name}** — ${w.status}${
            typeof w.runs === "number" ? ` · ${w.runs.toLocaleString()} runs` : ""
          }`,
      ),
      "",
      `Open **${path}**.`,
    ].join("\n"),
    citations: [cite(path, "Workflows")],
    toolsUsed: ["query_executor", "section:workflows"],
    sections: ["workflows"],
    filterStatus: plan.filters.status ?? null,
    queryOp: "list",
  };
}

/**
 * Execute an exact count/list/next query plan against live org data.
 * Returns null when the plan is not an exact-data op or section is unsupported.
 */
export async function executeAvaQueryPlan(
  ctx: OrgContext,
  plan: AvaQueryPlan,
): Promise<QueryExecutionResult | null> {
  if (plan.op !== "count" && plan.op !== "list" && plan.op !== "next") {
    return null;
  }
  if (!plan.section) return null;

  switch (plan.section) {
    case "appointments":
      return executeAppointments(ctx, plan);
    case "calls":
      return executeCalls(ctx, plan);
    case "invoices":
    case "billing":
      return executeInvoices(ctx, plan);
    case "integrations":
      return executeIntegrations(ctx, plan);
    case "workflows":
      return executeWorkflows(ctx, plan);
    default:
      return null;
  }
}

/** Exported for tests — appointment status matching including cancelled bucket. */
export function appointmentStatusesForFilter(
  status: AvaStatusFilter | AvaStatusFilter[] | undefined,
): AppointmentStatus[] {
  return statusList(status).filter((s): s is AppointmentStatus =>
    ["pending", "confirmed", "cancelled", "completed", "no_show"].includes(s),
  );
}
