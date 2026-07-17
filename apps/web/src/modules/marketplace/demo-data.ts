import type { MarketplaceAgent } from "./types";

export function listDemoMarketplaceAgents(): MarketplaceAgent[] {
  return [
    {
      id: "mp-1",
      name: "Dental Receptionist Pro",
      category: "Healthcare",
      description: "Inbound booking, insurance triage, and after-hours coverage.",
      installs: 1240,
      rating: 4.8,
      priceLabel: "Free",
    },
    {
      id: "mp-2",
      name: "Appointment Reminder Bot",
      category: "Scheduling",
      description: "SMS + voice reminders with confirm / reschedule intents.",
      installs: 980,
      rating: 4.6,
      priceLabel: "$29/mo",
    },
    {
      id: "mp-3",
      name: "Insurance Verifier",
      category: "Billing",
      description: "Collects payer details and creates CRM follow-ups.",
      installs: 640,
      rating: 4.5,
      priceLabel: "$49/mo",
    },
    {
      id: "mp-4",
      name: "Lead Qualifier",
      category: "Sales",
      description: "Scores inbound leads and routes hot deals to your team.",
      installs: 812,
      rating: 4.7,
      priceLabel: "Free",
    },
  ];
}
