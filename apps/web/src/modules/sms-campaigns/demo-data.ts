import type { SmsCampaign, SmsCampaignMetrics } from "./types";

const store = new Map<string, SmsCampaign[]>();

function defaults(): SmsCampaign[] {
  return [
    {
      id: "sms-1",
      name: "Dental Cleaning Reminder",
      description: "Reminder for upcoming hygiene visits",
      campaignType: "appointment",
      status: "completed",
      audienceCount: 1240,
      sentCount: 1188,
      deliveryRate: 98.4,
      responseRate: 7.2,
      sentAt: "2025-05-12T14:00:00.000Z",
    },
    {
      id: "sms-2",
      name: "Teeth Whitening Special",
      description: "Seasonal whitening promo",
      campaignType: "promotional",
      status: "completed",
      audienceCount: 980,
      sentCount: 942,
      deliveryRate: 97.9,
      responseRate: 9.1,
      sentAt: "2025-05-08T16:30:00.000Z",
    },
    {
      id: "sms-3",
      name: "We Miss You!",
      description: "Re-engage patients with no visit in 12 months",
      campaignType: "reengagement",
      status: "completed",
      audienceCount: 640,
      sentCount: 610,
      deliveryRate: 96.8,
      responseRate: 5.4,
      sentAt: "2025-05-03T11:00:00.000Z",
    },
    {
      id: "sms-4",
      name: "New Patient Welcome",
      description: "Onboarding sequence for first-time patients",
      campaignType: "transactional",
      status: "scheduled",
      audienceCount: 86,
      sentCount: 0,
      deliveryRate: 0,
      responseRate: 0,
      sentAt: null,
    },
  ];
}

export function listDemoSmsCampaigns(organizationId: string): SmsCampaign[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function demoSmsMetrics(): SmsCampaignMetrics {
  return {
    totalCampaigns: 24,
    messagesSent: 18745,
    deliveryRate: 98.7,
    responseRate: 6.3,
    optOuts: 56,
  };
}

export function demoSmsTemplates() {
  return [
    { id: "t1", name: "Appointment Reminder", body: "Hi {{first_name}}, reminder for {{date}}." },
    { id: "t2", name: "Special Offer", body: "Save 20% on whitening this month." },
    { id: "t3", name: "Missed Call Follow-up", body: "Sorry we missed you — reply BOOK to schedule." },
  ];
}
