import type { Action, Resource, UserRole } from "./types";

type PermissionMatrix = Record<UserRole, Partial<Record<Resource, Action[]>>>;

const ALL: Action[] = ["read", "create", "update", "delete", "manage", "invite", "publish"];
const READ: Action[] = ["read"];
const CRUD: Action[] = ["read", "create", "update", "delete"];

const MATRIX: PermissionMatrix = {
  OWNER: {
    organization: ALL,
    billing: ALL,
    members: ALL,
    agents: ALL,
    phone_numbers: ALL,
    routing: ALL,
    calls: ALL,
    appointments: ALL,
    knowledge: ALL,
    integrations: ALL,
    analytics: ALL,
    settings: ALL,
  },
  ADMIN: {
    organization: ["read", "update"],
    billing: READ,
    members: ["read", "create", "update", "invite", "manage"],
    agents: ALL,
    phone_numbers: ALL,
    routing: ALL,
    calls: ALL,
    appointments: ALL,
    knowledge: ALL,
    integrations: ALL,
    analytics: ALL,
    settings: ["read", "update", "manage"],
  },
  MANAGER: {
    organization: READ,
    billing: READ,
    members: ["read", "invite"],
    agents: READ,
    phone_numbers: READ,
    routing: CRUD,
    calls: CRUD,
    appointments: CRUD,
    knowledge: CRUD,
    integrations: READ,
    analytics: READ,
    settings: READ,
  },
  AGENT: {
    organization: READ,
    calls: ["read", "update"],
    appointments: ["read", "update"],
    knowledge: READ,
    analytics: READ,
    agents: READ,
    phone_numbers: READ,
  },
  VIEWER: {
    organization: READ,
    calls: READ,
    appointments: READ,
    analytics: READ,
    knowledge: READ,
    agents: READ,
    phone_numbers: READ,
    members: READ,
  },
};

export function can(role: UserRole, action: Action, resource: Resource): boolean {
  const allowed = MATRIX[role]?.[resource];
  if (!allowed) return false;
  return allowed.includes(action) || allowed.includes("manage");
}

export function assertCan(role: UserRole, action: Action, resource: Resource): void {
  if (!can(role, action, resource)) {
    throw new Error(`Forbidden: ${role} cannot ${action} ${resource}`);
  }
}

export function roleAtLeast(role: UserRole, minimum: UserRole): boolean {
  const order: UserRole[] = ["VIEWER", "AGENT", "MANAGER", "ADMIN", "OWNER"];
  return order.indexOf(role) >= order.indexOf(minimum);
}
