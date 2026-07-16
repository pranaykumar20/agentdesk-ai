export const USER_ROLES = ["OWNER", "ADMIN", "MANAGER", "AGENT", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const RESOURCES = [
  "organization",
  "billing",
  "members",
  "agents",
  "phone_numbers",
  "routing",
  "calls",
  "appointments",
  "knowledge",
  "integrations",
  "analytics",
  "settings",
] as const;
export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = ["read", "create", "update", "delete", "manage", "invite", "publish"] as const;
export type Action = (typeof ACTIONS)[number];
