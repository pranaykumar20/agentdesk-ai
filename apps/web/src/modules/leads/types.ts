export type LeadStatus = "new" | "qualified" | "callback" | "won" | "lost" | string;

export type LeadListItem = {
  id: string;
  organizationId: string;
  contactId: string | null;
  contactName: string;
  contactPhone: string | null;
  source: string | null;
  status: LeadStatus;
  score: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
