export type DealStage =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type CrmDeal = {
  id: string;
  title: string;
  contactName: string;
  interest: string;
  stage: DealStage;
  valueCents: number;
  source: string;
  ownerName: string;
  updatedAt: string;
};

export type CrmTask = {
  id: string;
  title: string;
  dueLabel: string;
  urgency: "today" | "tomorrow" | "later";
};

export const DEAL_STAGES: Array<{ id: DealStage; label: string; tone: string }> = [
  { id: "new_lead", label: "New Lead", tone: "bg-sky-500" },
  { id: "contacted", label: "Contacted", tone: "bg-amber-500" },
  { id: "qualified", label: "Qualified", tone: "bg-emerald-500" },
  { id: "proposal", label: "Proposal Sent", tone: "bg-violet-500" },
  { id: "won", label: "Won", tone: "bg-green-700" },
  { id: "lost", label: "Lost", tone: "bg-rose-500" },
];
