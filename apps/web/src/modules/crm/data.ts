import { DEAL_STAGES, type CrmDeal, type DealStage } from "./types";
import { listDemoDeals, listDemoTasks } from "./demo-data";

export async function listCrmDeals(organizationId: string): Promise<CrmDeal[]> {
  return listDemoDeals(organizationId);
}

export async function getCrmPipelineSummary(organizationId: string) {
  const deals = await listCrmDeals(organizationId);
  const byStage = DEAL_STAGES.map((stage) => {
    const items = deals.filter((d) => d.stage === stage.id);
    const valueCents = items.reduce((sum, d) => sum + d.valueCents, 0);
    return { ...stage, count: items.length, valueCents, items };
  });
  const totalValueCents = deals.reduce((sum, d) => sum + d.valueCents, 0);
  const sources = Object.entries(
    deals.reduce<Record<string, number>>((acc, d) => {
      acc[d.source] = (acc[d.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([source, count]) => ({ source, count }));

  return {
    deals,
    byStage,
    totalDeals: deals.length,
    totalValueCents,
    sources,
    tasks: listDemoTasks(),
  };
}

export async function moveCrmDeal(
  organizationId: string,
  dealId: string,
  stage: DealStage,
): Promise<CrmDeal | null> {
  const deals = listDemoDeals(organizationId);
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) return null;
  deal.stage = stage;
  deal.updatedAt = new Date().toISOString();
  return deal;
}
