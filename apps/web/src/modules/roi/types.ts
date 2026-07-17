export type RoiMetrics = {
  totalRevenueCents: number;
  aiAttributedCents: number;
  totalCostCents: number;
  grossProfitCents: number;
  roiPercent: number;
  totalCalls: number;
  appointmentsBooked: number;
  newPatients: number;
  conversionRate: number;
  costPerAcquisitionCents: number;
};

export type RoiSource = { source: string; pct: number };
export type RoiAgent = { name: string; revenueCents: number; growthPct: number };
