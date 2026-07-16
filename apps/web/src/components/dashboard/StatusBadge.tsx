import { Badge } from "@/components/ui/badge";

const CALL_STATUS: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }> = {
  completed: { label: "Answered", variant: "success" },
  missed: { label: "Missed", variant: "destructive" },
  voicemail: { label: "Voicemail", variant: "default" },
  no_answer: { label: "Missed", variant: "destructive" },
  in_progress: { label: "In progress", variant: "warning" },
  ringing: { label: "Ringing", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
};

const APPT_STATUS: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }> = {
  confirmed: { label: "Confirmed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  no_show: { label: "No show", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
};

const DOC_STATUS: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }> = {
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  processing: { label: "Processing", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
};

export function CallStatusBadge({ status }: { status: string }) {
  const cfg = CALL_STATUS[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const cfg = APPT_STATUS[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function KnowledgeStatusBadge({ status }: { status: string }) {
  const cfg = DOC_STATUS[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function DispositionBadge({ disposition }: { disposition: string | null }) {
  if (!disposition) return <span className="text-sm text-muted-foreground">—</span>;
  return <Badge variant="default">{disposition}</Badge>;
}
