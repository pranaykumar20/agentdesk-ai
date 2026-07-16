import { prisma } from "@ai-voice-leads/db";

export type IntegrationEvent = "lead.created" | "call.completed";

export interface LeadEventPayload {
  event: IntegrationEvent;
  orgId: string;
  leadId?: string;
  callSessionId?: string;
  data: Record<string, unknown>;
}

export async function dispatchIntegrations(payload: LeadEventPayload) {
  const integrations = await prisma.integration.findMany({
    where: { orgId: payload.orgId, enabled: true },
  });

  await Promise.all(
    integrations.map((integration) => {
      switch (integration.provider) {
        case "WEBHOOK":
          return sendWebhook(integration.config as { url?: string }, payload);
        case "GOOGLE_SHEETS":
          return appendToGoogleSheets(integration, payload);
        case "HUBSPOT":
          return syncToHubSpot(integration, payload);
        default:
          return Promise.resolve();
      }
    }),
  );
}

async function sendWebhook(config: { url?: string }, payload: LeadEventPayload) {
  const url = config.url?.trim();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[integrations] webhook failed:", err);
  }
}

async function appendToGoogleSheets(
  integration: { credentials: unknown; config: unknown },
  payload: LeadEventPayload,
) {
  const creds = integration.credentials as { webhookUrl?: string };
  const url = creds.webhookUrl?.trim();
  if (!url) {
    console.warn("[integrations] Google Sheets webhook URL not configured");
    return;
  }

  await sendWebhook({ url }, payload);
}

async function syncToHubSpot(
  integration: { credentials: unknown },
  payload: LeadEventPayload,
) {
  const creds = integration.credentials as { accessToken?: string };
  const token = creds.accessToken?.trim();
  if (!token) {
    console.warn("[integrations] HubSpot access token not configured");
    return;
  }

  if (payload.event !== "lead.created" || !payload.data.name) return;

  const properties = {
    firstname: String(payload.data.name ?? "").split(" ")[0],
    lastname: String(payload.data.name ?? "").split(" ").slice(1).join(" ") || "Lead",
    phone: String(payload.data.phone ?? ""),
    email: String(payload.data.email ?? ""),
    company: String(payload.data.orgName ?? ""),
  };

  try {
    await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });
  } catch (err) {
    console.error("[integrations] HubSpot sync failed:", err);
  }
}

export async function saveIntegration(params: {
  orgId: string;
  provider: "HUBSPOT" | "GOOGLE_SHEETS" | "WEBHOOK";
  credentials?: Record<string, unknown>;
  config?: Record<string, unknown>;
}) {
  return prisma.integration.upsert({
    where: {
      orgId_provider: { orgId: params.orgId, provider: params.provider },
    },
    update: {
      credentials: (params.credentials ?? {}) as object,
      config: (params.config ?? {}) as object,
      enabled: true,
    },
    create: {
      orgId: params.orgId,
      provider: params.provider,
      credentials: (params.credentials ?? {}) as object,
      config: (params.config ?? {}) as object,
      enabled: true,
    },
  });
}
