import type { ConversationChannel } from "./types";
import {
  demoContactCenterMetrics,
  demoQueueOverview,
  demoTopAgents,
  listDemoConversations,
} from "./demo-data";

export async function listContactConversations(
  organizationId: string,
  channel: "all" | ConversationChannel = "all",
) {
  const all = listDemoConversations(organizationId);
  if (channel === "all") return all;
  return all.filter((c) => c.channel === channel);
}

export async function getContactCenterSummary(organizationId: string) {
  const conversations = await listContactConversations(organizationId);
  return {
    conversations,
    metrics: demoContactCenterMetrics(),
    queues: demoQueueOverview(),
    topAgents: demoTopAgents(),
  };
}
