import { getDemoIntegrations, setDemoIntegrations } from "./demo-data";
import type { IntegrationItem, IntegrationStatus } from "./types";

export async function listIntegrations(organizationId: string): Promise<IntegrationItem[]> {
  return getDemoIntegrations(organizationId);
}

export async function getIntegrationMetrics(organizationId: string) {
  const items = await listIntegrations(organizationId);
  return {
    total: items.length,
    connected: items.filter((i) => i.status === "connected").length,
    needsAttention: items.filter((i) => i.status === "needs_attention" || i.status === "error").length,
    disconnected: items.filter((i) => i.status === "disconnected" || i.status === "expired").length,
  };
}

export async function setIntegrationStatus(
  organizationId: string,
  id: string,
  status: IntegrationStatus,
): Promise<IntegrationItem | null> {
  const items = await listIntegrations(organizationId);
  const next = items.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      connectedOn:
        status === "connected" ? item.connectedOn ?? new Date().toISOString() : item.connectedOn,
      lastSync: status === "connected" ? new Date().toISOString() : item.lastSync,
    };
  });
  setDemoIntegrations(organizationId, next);
  return next.find((i) => i.id === id) ?? null;
}
