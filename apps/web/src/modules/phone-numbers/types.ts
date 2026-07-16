export type PhoneNumberStatus = "active" | "forwarding" | "unavailable" | "in_use";

export type PhoneNumberItem = {
  id: string;
  organizationId: string;
  e164: string;
  friendlyName: string;
  numberType: "local" | "toll_free";
  provider: string;
  assignedTo: string;
  location: string;
  status: PhoneNumberStatus;
  callsLast30Days: number;
  callsTrendPct: number;
  lastActivityAt: string;
};
