import type { CrmDeal, CrmTask } from "./types";

const dealsStore = new Map<string, CrmDeal[]>();

function defaultDeals(): CrmDeal[] {
  const now = new Date().toISOString();
  return [
    {
      id: "deal-1",
      title: "John Smith",
      contactName: "John Smith",
      interest: "Teeth Whitening Inquiry",
      stage: "new_lead",
      valueCents: 45000,
      source: "Website",
      ownerName: "Tiffany S.",
      updatedAt: now,
    },
    {
      id: "deal-2",
      title: "David Wilson",
      contactName: "David Wilson",
      interest: "New Patient Consult",
      stage: "contacted",
      valueCents: 120000,
      source: "Google Ads",
      ownerName: "Tiffany S.",
      updatedAt: now,
    },
    {
      id: "deal-3",
      title: "Lisa Thomas",
      contactName: "Lisa Thomas",
      interest: "Invisalign Quote",
      stage: "qualified",
      valueCents: 380000,
      source: "Referral",
      ownerName: "Alex M.",
      updatedAt: now,
    },
    {
      id: "deal-4",
      title: "Maria Garcia",
      contactName: "Maria Garcia",
      interest: "Implant Evaluation",
      stage: "proposal",
      valueCents: 520000,
      source: "Phone Call",
      ownerName: "Alex M.",
      updatedAt: now,
    },
    {
      id: "deal-5",
      title: "James Lee",
      contactName: "James Lee",
      interest: "Family Plan",
      stage: "won",
      valueCents: 210000,
      source: "Website",
      ownerName: "Tiffany S.",
      updatedAt: now,
    },
    {
      id: "deal-6",
      title: "Karen Brooks",
      contactName: "Karen Brooks",
      interest: "Emergency Visit",
      stage: "lost",
      valueCents: 90000,
      source: "Google Ads",
      ownerName: "Alex M.",
      updatedAt: now,
    },
  ];
}

export function listDemoDeals(organizationId: string): CrmDeal[] {
  if (!dealsStore.has(organizationId)) {
    dealsStore.set(organizationId, defaultDeals());
  }
  return dealsStore.get(organizationId)!;
}

export function listDemoTasks(): CrmTask[] {
  return [
    { id: "t1", title: "Follow up with David Wilson", dueLabel: "Today", urgency: "today" },
    { id: "t2", title: "Send proposal to Lisa Thomas", dueLabel: "Tomorrow", urgency: "tomorrow" },
    { id: "t3", title: "Confirm Maria Garcia consult", dueLabel: "Fri", urgency: "later" },
  ];
}
