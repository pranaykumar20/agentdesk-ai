import type { IntegrationItem } from "./types";

const store = new Map<string, IntegrationItem[]>();

export function buildDemoIntegrations(organizationId: string): IntegrationItem[] {
  void organizationId;
  return [
    {
      id: "int-google-calendar",
      key: "google_calendar",
      name: "Google Calendar",
      category: "Scheduling",
      status: "connected",
      connectedOn: "2024-01-15T12:00:00.000Z",
      lastSync: new Date(Date.now() - 2 * 60_000).toISOString(),
      description: "Sync appointments and availability",
    },
    {
      id: "int-twilio",
      key: "twilio",
      name: "Twilio",
      category: "Communication",
      status: "connected",
      connectedOn: "2024-01-10T12:00:00.000Z",
      lastSync: new Date(Date.now() - 60_000).toISOString(),
      description: "Phone numbers and SMS",
    },
    {
      id: "int-retell",
      key: "retell",
      name: "Retell AI",
      category: "Communication",
      status: "connected",
      connectedOn: "2024-02-01T12:00:00.000Z",
      lastSync: new Date(Date.now() - 5 * 60_000).toISOString(),
      description: "AI voice agents",
    },
    {
      id: "int-hubspot",
      key: "hubspot",
      name: "HubSpot",
      category: "CRM",
      status: "connected",
      connectedOn: "2024-02-20T12:00:00.000Z",
      lastSync: new Date(Date.now() - 15 * 60_000).toISOString(),
      description: "CRM sync",
    },
    {
      id: "int-slack",
      key: "slack",
      name: "Slack",
      category: "Communication",
      status: "needs_attention",
      connectedOn: "2024-03-01T12:00:00.000Z",
      lastSync: new Date(Date.now() - 86400_000).toISOString(),
      description: "Team notifications",
    },
    {
      id: "int-stripe",
      key: "stripe",
      name: "Stripe",
      category: "Payments",
      status: "connected",
      connectedOn: "2024-01-20T12:00:00.000Z",
      lastSync: new Date(Date.now() - 5 * 60_000).toISOString(),
      description: "Billing and payments",
    },
    {
      id: "int-mailchimp",
      key: "mailchimp",
      name: "Mailchimp",
      category: "Marketing",
      status: "disconnected",
      connectedOn: null,
      lastSync: null,
      description: "Email marketing (placeholder)",
    },
    {
      id: "int-zapier",
      key: "zapier",
      name: "Zapier",
      category: "Automation",
      status: "disconnected",
      connectedOn: null,
      lastSync: null,
      description: "Webhook automation (placeholder)",
    },
  ];
}

export function getDemoIntegrations(organizationId: string): IntegrationItem[] {
  return store.get(organizationId) ?? buildDemoIntegrations(organizationId);
}

export function setDemoIntegrations(organizationId: string, items: IntegrationItem[]): void {
  store.set(organizationId, items);
}
