import type { VoiceFlow, VoicePaletteItem } from "./types";

const store = new Map<string, VoiceFlow[]>();

function inboundNodes(): VoiceFlow["nodes"] {
  return [
    {
      id: "v1",
      kind: "start",
      title: "Incoming Call",
      description: "Flow starts when the line rings",
    },
    {
      id: "v2",
      kind: "speak",
      title: "Greeting",
      description: "Hi! Thank you for calling {business_name}. How can I help you today?",
    },
    {
      id: "v3",
      kind: "listen",
      title: "Capture Intent",
      description: "Speech or DTMF input",
    },
    {
      id: "v4",
      kind: "logic",
      title: "Check Intent",
      description: "Route by detected intent",
    },
    {
      id: "v5",
      kind: "flow",
      title: "Appointment Flow",
      description: "Go to booking subflow",
      branchLabel: "Book Appointment",
    },
    {
      id: "v6",
      kind: "flow",
      title: "Insurance Flow",
      description: "Go to insurance FAQ",
      branchLabel: "Insurance Question",
    },
    {
      id: "v7",
      kind: "action",
      title: "Transfer Call",
      description: "Connect to live team",
      branchLabel: "Speak to Human",
    },
    {
      id: "v8",
      kind: "speak",
      title: "Out of Scope",
      description: "I'm sorry, I can help with appointments, insurance, or billing.",
      branchLabel: "Out of Scope",
    },
    {
      id: "v9",
      kind: "flow",
      title: "End Flow",
      description: "Thank you. Goodbye!",
    },
  ];
}

function defaults(): VoiceFlow[] {
  const now = new Date().toISOString();
  return [
    {
      id: "vf-1",
      name: "Dental Receptionist - Inbound Call",
      description: "Main inbound IVR with intent routing and human transfer.",
      status: "draft",
      agentName: "Dental Receptionist AI",
      updatedAt: now,
      nodes: inboundNodes(),
    },
    {
      id: "vf-2",
      name: "After-Hours Voicemail",
      description: "Collect callback details when the office is closed.",
      status: "published",
      agentName: "After Hours AI",
      updatedAt: now,
      nodes: [
        {
          id: "a1",
          kind: "start",
          title: "Incoming Call",
          description: "After-hours entry",
        },
        {
          id: "a2",
          kind: "speak",
          title: "Closed Message",
          description: "We're currently closed. Please leave a message.",
        },
        {
          id: "a3",
          kind: "listen",
          title: "Record Message",
          description: "Capture voicemail audio",
        },
        {
          id: "a4",
          kind: "flow",
          title: "End Flow",
          description: "Thank the caller",
        },
      ],
    },
  ];
}

export function listDemoVoiceFlows(organizationId: string): VoiceFlow[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function getDemoVoiceFlow(organizationId: string, id: string): VoiceFlow | null {
  return listDemoVoiceFlows(organizationId).find((f) => f.id === id) ?? null;
}

export const VOICE_PALETTE: VoicePaletteItem[] = [
  {
    id: "speak-msg",
    group: "Speak",
    title: "Message",
    description: "AI speaks text",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "speak-audio",
    group: "Speak",
    title: "Play Audio",
    description: "Play a recording",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "listen-input",
    group: "Listen",
    title: "User Input",
    description: "Capture response",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "listen-dtmf",
    group: "Listen",
    title: "DTMF Input",
    description: "Keypad digits",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "logic-cond",
    group: "Logic",
    title: "Condition",
    description: "Branch paths",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    id: "logic-var",
    group: "Logic",
    title: "Set Variable",
    description: "Store a value",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    id: "flow-goto",
    group: "Flow",
    title: "Go To",
    description: "Jump to a step",
    tone: "bg-rose-100 text-rose-700",
  },
  {
    id: "flow-end",
    group: "Flow",
    title: "End Flow",
    description: "Hang up politely",
    tone: "bg-rose-100 text-rose-700",
  },
];
