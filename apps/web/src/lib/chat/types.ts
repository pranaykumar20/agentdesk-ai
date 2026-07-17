export type AvaCitation = {
  label: string;
  path: string;
  tool?: string;
};

export type ProposedActionType =
  | "invite_team_member"
  | "pause_ai_employee"
  | "set_integration_status";

export type ProposedAction = {
  id: string;
  type: ProposedActionType;
  organizationId: string;
  requestedByUserId: string;
  summary: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
};
