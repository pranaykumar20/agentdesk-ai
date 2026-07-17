import type { PlatformFlagRow, PlatformHealth, PlatformTenant } from "./types";

export function demoTenants(): PlatformTenant[] {
  return [
    {
      id: "org-1",
      name: "Smile Dental Care",
      plan: "Professional",
      status: "active",
      seats: 12,
      usageMinutes: 2480,
      createdAt: "2025-01-12T00:00:00.000Z",
    },
    {
      id: "org-2",
      name: "Bright Orthodontics",
      plan: "Growth",
      status: "trialing",
      seats: 6,
      usageMinutes: 640,
      createdAt: "2025-04-02T00:00:00.000Z",
    },
    {
      id: "org-3",
      name: "City Med Group",
      plan: "Enterprise",
      status: "past_due",
      seats: 40,
      usageMinutes: 9120,
      createdAt: "2024-11-18T00:00:00.000Z",
    },
    {
      id: "org-4",
      name: "Northside Dental",
      plan: "Starter",
      status: "canceled",
      seats: 3,
      usageMinutes: 120,
      createdAt: "2025-02-28T00:00:00.000Z",
    },
  ];
}

export function demoHealth(): PlatformHealth {
  return {
    api: "healthy",
    webhooks: "healthy",
    voice: "degraded",
    database: "healthy",
  };
}

export function demoFlags(): PlatformFlagRow[] {
  return [
    { key: "ai_employees", description: "AI Employee Builder", defaultEnabled: true },
    { key: "workflows", description: "Workflow Builder", defaultEnabled: true },
    { key: "marketplace", description: "Agent Marketplace", defaultEnabled: true },
    { key: "training", description: "AI Training Center", defaultEnabled: true },
    { key: "roi", description: "Revenue & ROI", defaultEnabled: true },
    { key: "website_importer", description: "Website Knowledge Importer", defaultEnabled: false },
  ];
}

export function demoAuditLog() {
  return [
    { id: "a1", actor: "system", action: "flag.updated", detail: "Enabled workflows default", at: "2h ago" },
    { id: "a2", actor: "admin@agentdesk.ai", action: "tenant.suspended", detail: "City Med Group past_due notice", at: "5h ago" },
    { id: "a3", actor: "system", action: "billing.sync", detail: "Stripe webhook reconciled 42 events", at: "1d ago" },
  ];
}
