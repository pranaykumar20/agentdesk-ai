import type { CallDetail, CallListItem, CallStatus } from "./types";

const NAMES = [
  ["John Smith", "(513) 555-0198", "jsmith@email.com"],
  ["Sarah Johnson", "(513) 555-0142", "sarah.j@email.com"],
  ["Michael Brown", "(513) 555-0177", "mbrown@email.com"],
  ["Emily Davis", "(513) 555-0111", "emily.d@email.com"],
  ["David Wilson", "(513) 555-0166", "dwilson@email.com"],
  ["Ava Martinez", "(513) 555-0133", "ava.m@email.com"],
  ["James Lee", "(513) 555-0188", null],
  ["Olivia Chen", "(513) 555-0122", "olivia.c@email.com"],
] as const;

const DISPOSITIONS = [
  "Book Appointment",
  "Office Hours",
  "Insurance Inquiry",
  "Pricing & Costs",
  "General Inquiry",
] as const;

function statusForIndex(i: number): CallStatus {
  if (i % 10 === 0) return "missed";
  if (i % 7 === 0) return "voicemail";
  return "completed";
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

export function buildDemoCalls(organizationId: string): CallListItem[] {
  return Array.from({ length: 48 }, (_, i) => {
    const [name, phone, email] = NAMES[i % NAMES.length]!;
    const status = statusForIndex(i);
    return {
      id: `demo-call-${String(i + 1).padStart(3, "0")}`,
      organizationId,
      callerName: name,
      callerPhone: phone,
      callerEmail: email,
      direction: "inbound",
      status,
      disposition: status === "missed" ? null : DISPOSITIONS[i % DISPOSITIONS.length]!,
      agentName: "AI Agent - Ava",
      phoneNumber: "+1 (513) 555-0100",
      durationSeconds: status === "missed" ? null : 90 + i * 3,
      startedAt: isoHoursAgo(i * 3 + 1),
      sentiment: status === "missed" ? null : i % 4 === 0 ? "neutral" : "positive",
      tags: i % 5 === 0 ? ["New Patient"] : [],
    };
  });
}

export function buildDemoCallDetail(call: CallListItem): CallDetail {
  return {
    ...call,
    notes: "Caller wants a teeth cleaning appointment next week.",
    summary:
      "Caller requested a teeth cleaning. Ava offered Tuesday 9:00 AM or 10:30 AM. Caller confirmed 10:30 AM with Dr. Sarah Johnson.",
    keyTopics: [
      { topic: "Appointment Scheduling", weight: 65 },
      { topic: "Teeth Cleaning", weight: 20 },
      { topic: "Insurance", weight: 10 },
      { topic: "Location / Hours", weight: 5 },
    ],
    insights: [
      "Caller is a new patient interested in regular cleaning.",
      "Prefers morning appointments.",
      "Book appointment confirmed for next available Tuesday at 10:30 AM.",
    ],
    recordingAvailable: call.status === "completed",
    endedAt: call.startedAt
      ? new Date(new Date(call.startedAt).getTime() + (call.durationSeconds ?? 0) * 1000).toISOString()
      : null,
    transcript: [
      {
        id: "t1",
        speaker: "ai",
        displayName: "Ava",
        content: "Hi! Thanks for calling Smile Dental Care. How can I help you today?",
        startedAtMs: 0,
      },
      {
        id: "t2",
        speaker: "caller",
        displayName: call.callerName,
        content: "Hi, I'd like to book a teeth cleaning appointment.",
        startedAtMs: 4000,
      },
      {
        id: "t3",
        speaker: "ai",
        displayName: "Ava",
        content: "I'd be happy to help with that. Are mornings or afternoons better for you?",
        startedAtMs: 9000,
      },
      {
        id: "t4",
        speaker: "caller",
        displayName: call.callerName,
        content: "Mornings work best. Maybe next week?",
        startedAtMs: 16000,
      },
      {
        id: "t5",
        speaker: "ai",
        displayName: "Ava",
        content: "I have Tuesday at 9:00 AM or 10:30 AM with Dr. Sarah Johnson. Which works for you?",
        startedAtMs: 22000,
      },
      {
        id: "t6",
        speaker: "caller",
        displayName: call.callerName,
        content: "10:30 AM sounds perfect.",
        startedAtMs: 28000,
      },
      {
        id: "t7",
        speaker: "ai",
        displayName: "Ava",
        content: "You're all set for Tuesday at 10:30 AM. I'll send a confirmation shortly. Anything else?",
        startedAtMs: 34000,
      },
      {
        id: "t8",
        speaker: "caller",
        displayName: call.callerName,
        content: "That's all, thank you!",
        startedAtMs: 40000,
      },
    ],
  };
}
