import {
  demoWhatsappMetrics,
  demoWhatsappWorkflows,
  listDemoWhatsappConversations,
} from "./demo-data";

export async function listWhatsappConversations(organizationId: string) {
  return listDemoWhatsappConversations(organizationId);
}

export async function getWhatsappSummary(organizationId: string) {
  const conversations = await listWhatsappConversations(organizationId);
  return {
    conversations,
    metrics: demoWhatsappMetrics(),
    workflows: demoWhatsappWorkflows(),
  };
}
