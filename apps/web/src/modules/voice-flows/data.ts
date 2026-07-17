import { getDemoVoiceFlow, listDemoVoiceFlows, VOICE_PALETTE } from "./demo-data";
import type { VoiceFlow } from "./types";

export async function listVoiceFlows(organizationId: string): Promise<VoiceFlow[]> {
  return listDemoVoiceFlows(organizationId);
}

export async function getVoiceFlow(
  organizationId: string,
  id: string,
): Promise<VoiceFlow | null> {
  return getDemoVoiceFlow(organizationId, id);
}

export function getVoicePalette() {
  return VOICE_PALETTE;
}

export async function getVoiceFlowMetrics(organizationId: string) {
  const flows = await listVoiceFlows(organizationId);
  return {
    total: flows.length,
    published: flows.filter((f) => f.status === "published").length,
    draft: flows.filter((f) => f.status === "draft").length,
  };
}
