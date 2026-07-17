import type { RoiAgent, RoiMetrics, RoiSource } from "./types";

export function demoRoiMetrics(): RoiMetrics {
  return {
    totalRevenueCents: 4268500,
    aiAttributedCents: 2834000,
    totalCostCents: 875200,
    grossProfitCents: 3393300,
    roiPercent: 287,
    totalCalls: 1248,
    appointmentsBooked: 436,
    newPatients: 312,
    conversionRate: 34.9,
    costPerAcquisitionCents: 2805,
  };
}

export function demoRoiSources(): RoiSource[] {
  return [
    { source: "Phone Calls", pct: 43.5 },
    { source: "Website / Chat", pct: 29.1 },
    { source: "SMS / WhatsApp", pct: 14.6 },
    { source: "Walk-ins", pct: 8.1 },
    { source: "Other", pct: 4.7 },
  ];
}

export function demoRoiAgents(): RoiAgent[] {
  return [
    { name: "Receptionist AI", revenueCents: 1124000, growthPct: 18 },
    { name: "Appointment Setter AI", revenueCents: 864000, growthPct: 22 },
    { name: "Insurance AI", revenueCents: 512000, growthPct: 11 },
    { name: "Billing AI", revenueCents: 334000, growthPct: 9 },
  ];
}

export function demoRoiInsights() {
  return [
    "AI is driving 66.4% of your total revenue this period.",
    "Cost per acquisition dropped 6.4% vs prior month.",
    "Appointment Setter AI is the fastest-growing revenue contributor.",
    "Phone remains the top revenue source at 43.5%.",
  ];
}
