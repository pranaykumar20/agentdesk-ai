import type { Workflow, WorkflowPaletteItem } from "./types";

const store = new Map<string, Workflow[]>();

function defaultGraph(): Workflow["graph"] {
  return {
    nodes: [
      {
        id: "n1",
        kind: "trigger",
        title: "New Call Received",
        description: "When a new call is received",
      },
      {
        id: "n2",
        kind: "ai",
        title: "Analyze Call with AI",
        description: "Extract intent, sentiment and details",
      },
      {
        id: "n3",
        kind: "condition",
        title: "Is Appointment Request?",
        description: "Intent is Appointment",
      },
      {
        id: "n4",
        kind: "action",
        title: "Check Availability",
        description: "Google Calendar lookup",
        branch: "yes",
      },
      {
        id: "n5",
        kind: "action",
        title: "Book Appointment",
        description: "Create in Calendar & CRM",
        branch: "yes",
      },
      {
        id: "n6",
        kind: "action",
        title: "Send Confirmation SMS",
        description: "Notify the caller",
        branch: "yes",
      },
      {
        id: "n7",
        kind: "action",
        title: "Create Lead",
        description: "Add to CRM pipeline",
        branch: "no",
      },
      {
        id: "n8",
        kind: "action",
        title: "Send Follow-up Email",
        description: "Auto follow-up sequence",
        branch: "no",
      },
      {
        id: "n9",
        kind: "action",
        title: "Notify Team on Slack",
        description: "Send notification",
      },
    ],
  };
}

function defaults(): Workflow[] {
  const now = new Date().toISOString();
  return [
    {
      id: "wf-1",
      name: "New Patient Appointment Workflow",
      description: "Book appointments from inbound calls and follow up when intent differs.",
      status: "draft",
      runs: 128,
      lastRunAt: now,
      updatedAt: now,
      graph: defaultGraph(),
    },
    {
      id: "wf-2",
      name: "Missed Call Follow-up",
      description: "SMS + CRM task when a call is missed during business hours.",
      status: "published",
      runs: 842,
      lastRunAt: now,
      updatedAt: now,
      graph: {
        nodes: [
          {
            id: "m1",
            kind: "trigger",
            title: "Missed Call",
            description: "When a call is missed",
          },
          {
            id: "m2",
            kind: "action",
            title: "Send SMS",
            description: "Offer to book online",
          },
          {
            id: "m3",
            kind: "action",
            title: "Create Task",
            description: "Assign front desk follow-up",
          },
        ],
      },
    },
    {
      id: "wf-3",
      name: "Insurance Lead Capture",
      description: "Capture insurance questions into CRM with email confirmation.",
      status: "published",
      runs: 356,
      lastRunAt: now,
      updatedAt: now,
      graph: { nodes: [] },
    },
  ];
}

export function listDemoWorkflows(organizationId: string): Workflow[] {
  if (!store.has(organizationId)) {
    store.set(organizationId, defaults());
  }
  return store.get(organizationId)!;
}

export function getDemoWorkflow(organizationId: string, id: string): Workflow | null {
  return listDemoWorkflows(organizationId).find((w) => w.id === id) ?? null;
}

export function saveDemoWorkflow(
  organizationId: string,
  id: string,
  patch: Partial<Pick<Workflow, "name" | "status" | "graph">>,
): Workflow | null {
  const workflows = listDemoWorkflows(organizationId);
  const workflow = workflows.find((w) => w.id === id);
  if (!workflow) return null;
  Object.assign(workflow, patch, { updatedAt: new Date().toISOString() });
  return workflow;
}

export const WORKFLOW_PALETTE: WorkflowPaletteItem[] = [
  {
    id: "trig-call",
    group: "Triggers",
    title: "New Call",
    description: "When a call starts",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    id: "trig-form",
    group: "Triggers",
    title: "New Form Submission",
    description: "Web form submitted",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "trig-appt",
    group: "Triggers",
    title: "New Appointment",
    description: "Booking created",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    id: "trig-lead",
    group: "Triggers",
    title: "New Lead",
    description: "CRM lead created",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "act-sms",
    group: "Actions",
    title: "Send SMS",
    description: "Text the contact",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "act-email",
    group: "Actions",
    title: "Send Email",
    description: "Email the contact",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "act-task",
    group: "Actions",
    title: "Create Task",
    description: "Assign a follow-up",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    id: "act-crm",
    group: "Actions",
    title: "Add to CRM",
    description: "Create or update deal",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    id: "cond-filter",
    group: "Conditions",
    title: "Filter",
    description: "Continue if match",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    id: "cond-branch",
    group: "Conditions",
    title: "Branch",
    description: "Yes / No paths",
    tone: "bg-sky-100 text-sky-700",
  },
];
