import { demoSmsMetrics, demoSmsTemplates, listDemoSmsCampaigns } from "./demo-data";

export async function listSmsCampaigns(organizationId: string) {
  return listDemoSmsCampaigns(organizationId);
}

export async function getSmsCampaignSummary(organizationId: string) {
  const campaigns = await listSmsCampaigns(organizationId);
  return {
    campaigns,
    metrics: demoSmsMetrics(),
    templates: demoSmsTemplates(),
  };
}
