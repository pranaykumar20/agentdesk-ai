import { randomBytes } from "node:crypto";
import type { OrgContext } from "@/lib/auth";
import { can, type UserRole } from "@/lib/permissions";
import { updateAgentDraft } from "@/modules/agents/data";
import { setIntegrationStatus } from "@/modules/integrations/data";
import type { IntegrationStatus } from "@/modules/integrations/types";
import { inviteTeamMember } from "@/modules/team/data";
import type { ProposedAction, ProposedActionType } from "./types";

export type { ProposedAction, ProposedActionType };

const ACTION_TTL_MS = 15 * 60_000;
const store = new Map<string, ProposedAction>();

function prune() {
  const now = Date.now();
  for (const [id, action] of store) {
    if (new Date(action.expiresAt).getTime() < now) {
      action.status = "expired";
      store.delete(id);
    }
  }
}

export function createProposedAction(
  ctx: OrgContext,
  input: {
    type: ProposedActionType;
    summary: string;
    payload: Record<string, unknown>;
  },
): ProposedAction {
  prune();
  const action: ProposedAction = {
    id: `act_${randomBytes(12).toString("hex")}`,
    type: input.type,
    organizationId: ctx.organization.id,
    requestedByUserId: ctx.membership.user_id,
    summary: input.summary,
    payload: input.payload,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ACTION_TTL_MS).toISOString(),
    status: "pending",
  };
  store.set(action.id, action);
  return {
    ...action,
    // Do not leak invite tokens etc. in client-facing copies — payload is safe fields only.
  };
}

export function getProposedAction(id: string): ProposedAction | null {
  prune();
  return store.get(id) ?? null;
}

export type ActionConfirmResult =
  | { ok: true; message: string; result?: unknown }
  | { ok: false; error: string };

export async function confirmProposedAction(
  ctx: OrgContext,
  userId: string,
  actionId: string,
): Promise<ActionConfirmResult> {
  prune();
  const action = store.get(actionId);
  if (!action) return { ok: false, error: "Action not found or expired." };
  if (action.organizationId !== ctx.organization.id) {
    return { ok: false, error: "Forbidden: action belongs to another organization." };
  }
  if (action.requestedByUserId !== userId) {
    return { ok: false, error: "Forbidden: only the requester can confirm this action." };
  }
  if (action.status !== "pending") {
    return { ok: false, error: `Action is ${action.status}.` };
  }

  try {
    switch (action.type) {
      case "invite_team_member": {
        if (!can(ctx.role, "invite", "members")) {
          return { ok: false, error: "Permission denied." };
        }
        const fullName = String(action.payload.fullName ?? "");
        const email = String(action.payload.email ?? "");
        const role = String(action.payload.role ?? "AGENT") as UserRole;
        const department = String(action.payload.department ?? "General");
        const invited = await inviteTeamMember({
          organizationId: ctx.organization.id,
          fullName,
          email,
          role,
          department,
        });
        action.status = "confirmed";
        store.set(action.id, action);
        return {
          ok: true,
          message: `Invited ${invited.fullName} as ${invited.role}.`,
          result: {
            id: invited.id,
            fullName: invited.fullName,
            email: invited.email,
            role: invited.role,
            status: invited.status,
          },
        };
      }
      case "pause_ai_employee": {
        if (!can(ctx.role, "update", "agents")) {
          return { ok: false, error: "Permission denied." };
        }
        const employeeId = String(action.payload.employeeId ?? "");
        const updated = await updateAgentDraft(ctx.organization.id, {
          id: employeeId,
          lifecycleStatus: "archived",
        });
        action.status = "confirmed";
        store.set(action.id, action);
        return {
          ok: true,
          message: `Paused ${updated.name} (archived).`,
          result: { id: updated.id, name: updated.name, lifecycleStatus: updated.lifecycleStatus },
        };
      }
      case "set_integration_status": {
        if (!can(ctx.role, "update", "integrations") && !can(ctx.role, "manage", "integrations")) {
          return { ok: false, error: "Permission denied." };
        }
        const integrationId = String(action.payload.integrationId ?? "");
        const status = String(action.payload.status ?? "") as IntegrationStatus;
        const item = await setIntegrationStatus(ctx.organization.id, integrationId, status);
        if (!item) return { ok: false, error: "Integration not found." };
        action.status = "confirmed";
        store.set(action.id, action);
        return {
          ok: true,
          message: `${item.name} is now ${item.status}.`,
          result: { id: item.id, name: item.name, status: item.status },
        };
      }
      default:
        return { ok: false, error: "Unknown action type." };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to confirm action.",
    };
  }
}

export function cancelProposedAction(
  ctx: OrgContext,
  userId: string,
  actionId: string,
): ActionConfirmResult {
  const action = store.get(actionId);
  if (!action) return { ok: false, error: "Action not found." };
  if (action.organizationId !== ctx.organization.id || action.requestedByUserId !== userId) {
    return { ok: false, error: "Forbidden." };
  }
  action.status = "cancelled";
  store.delete(actionId);
  return { ok: true, message: "Cancelled." };
}

/** Test helper */
export function __clearProposedActionsForTests() {
  store.clear();
}
