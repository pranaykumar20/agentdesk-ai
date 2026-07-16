export type CallStatus =
  | "ringing"
  | "in_progress"
  | "completed"
  | "missed"
  | "voicemail"
  | "failed"
  | "busy"
  | "no_answer";

export type CallDirection = "inbound" | "outbound";

export type CallListItem = {
  id: string;
  organizationId: string;
  callerName: string;
  callerPhone: string;
  callerEmail: string | null;
  direction: CallDirection;
  status: CallStatus;
  disposition: string | null;
  agentName: string;
  phoneNumber: string;
  durationSeconds: number | null;
  startedAt: string;
  sentiment: string | null;
  tags: string[];
};

export type CallTranscriptMessage = {
  id: string;
  speaker: "ai" | "caller" | "agent" | "system";
  displayName: string;
  content: string;
  startedAtMs: number | null;
};

export type CallDetail = CallListItem & {
  notes: string | null;
  summary: string | null;
  keyTopics: Array<{ topic: string; weight: number }>;
  insights: string[];
  transcript: CallTranscriptMessage[];
  recordingAvailable: boolean;
  endedAt: string | null;
};

export type CallListFilters = {
  tab?: "all" | "answered" | "missed" | "voicemails";
  q?: string;
  disposition?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
