import type { AccountSectionId } from "./account-sections";
import { SECTION_META } from "./account-sections";

export type ModuleKnowledge = {
  id: AccountSectionId;
  name: string;
  path: string;
  summary: string;
  capabilities: string[];
  connectsTo: string[];
};

const KNOWLEDGE: Partial<Record<AccountSectionId, Omit<ModuleKnowledge, "id" | "name" | "path">>> = {
  workflows: {
    summary:
      "Workflows are automations that run after events in your account — for example a missed call, a new lead, or a booked appointment. Each workflow chains triggers, conditions, and actions (SMS, CRM updates, assignments, AI employee steps).",
    capabilities: [
      "Trigger on calls, leads, appointments, or schedule",
      "Branch with conditions (missed, after-hours, location)",
      "Send SMS/WhatsApp, update CRM, notify team, run AI follow-up",
      "Publish drafts and monitor run history",
    ],
    connectsTo: ["Calls", "CRM / Leads", "SMS", "WhatsApp", "AI Employees", "Routing"],
  },
  call_queues: {
    summary:
      "Call queues distribute inbound callers to available agents (human or AI) using strategies like round-robin or skills-based routing. They track wait times, abandoned calls, and service level so you can staff and escalate correctly.",
    capabilities: [
      "Configure queue type, strategy, and staffing",
      "Watch live depth, wait, and abandon rate",
      "Set overflow / escalation when SLAs slip",
      "Tie queues to routing rules and contact center",
    ],
    connectsTo: ["Live Monitor", "Contact Center", "Routing", "Team", "AI Employees"],
  },
  ai_employees: {
    summary:
      "AI Employees are branded voice/chat agents (receptionists, schedulers, support) that answer callers, book appointments, qualify leads, and hand off to humans when needed.",
    capabilities: [
      "Draft and publish agent prompts, voice, and language",
      "Attach knowledge and capabilities",
      "Assign to phone numbers and queues",
      "Review performance and training jobs",
    ],
    connectsTo: ["Phone Numbers", "Knowledge Base", "Calls", "Workflows", "Training"],
  },
  calls: {
    summary:
      "Calls is your call history — transcripts, summaries, dispositions, and outcomes from AI and human-handled conversations.",
    capabilities: ["Filter by status/disposition", "Open transcripts and summaries", "Export or follow up"],
    connectsTo: ["Live Monitor", "Call Queues", "CRM", "Analytics"],
  },
  appointments: {
    summary:
      "Appointments tracks bookings created by AI employees or your team — upcoming visits, confirmations, and no-shows.",
    capabilities: ["View upcoming schedule", "Update status", "Tie bookings back to calls/leads"],
    connectsTo: ["AI Employees", "CRM", "Workflows", "Locations"],
  },
  contact_center: {
    summary:
      "Contact Center is the omnichannel inbox for conversations across voice-adjacent channels with SLA and queue views.",
    capabilities: ["Triage open conversations", "Monitor SLA/CSAT", "Route to queues"],
    connectsTo: ["Call Queues", "SMS", "WhatsApp", "Team"],
  },
  live_monitor: {
    summary:
      "Live Monitor shows active calls in real time so supervisors can listen, coach, or intervene.",
    capabilities: ["Watch live traffic", "Spot spikes and long waits"],
    connectsTo: ["Call Queues", "Calls", "Team"],
  },
  crm: {
    summary:
      "CRM / Leads is your pipeline of deals and contacts captured from calls, forms, and AI qualification.",
    capabilities: ["Track stages and deal value", "Update lead status", "Attribute revenue"],
    connectsTo: ["Calls", "Workflows", "WhatsApp", "Analytics / ROI"],
  },
  sms: {
    summary: "SMS Campaigns send and track text outreach and transactional messages tied to workflows.",
    capabilities: ["Launch campaigns", "Track delivery/read rates"],
    connectsTo: ["Workflows", "CRM", "Phone Numbers"],
  },
  whatsapp: {
    summary: "WhatsApp covers conversations and WhatsApp-specific workflows for messaging-first follow-up.",
    capabilities: ["Inbox conversations", "Active WA workflows", "Delivery metrics"],
    connectsTo: ["Workflows", "CRM", "Contact Center"],
  },
  phone_numbers: {
    summary: "Phone Numbers are the lines callers dial — assigned to AI employees, queues, or forwarding targets.",
    capabilities: ["Provision/connect numbers", "Assign agents", "Configure forwarding"],
    connectsTo: ["AI Employees", "Call Queues", "Routing"],
  },
  knowledge: {
    summary:
      "Knowledge Base holds FAQs and documents your AI employees use to answer accurately.",
    capabilities: ["Upload docs", "Publish FAQs", "Scope by location/agent"],
    connectsTo: ["AI Employees", "Training"],
  },
  team: {
    summary: "Team manages people, roles, and invites for your organization.",
    capabilities: ["Invite members", "Assign roles", "Review activity"],
    connectsTo: ["Settings", "Call Queues", "Locations"],
  },
  locations: {
    summary: "Locations represent offices/branches used for routing, hours, and multi-site reporting.",
    capabilities: ["Add sites", "Set phones/hours", "Route by location"],
    connectsTo: ["Routing", "Phone Numbers", "Appointments"],
  },
  routing: {
    summary:
      "Routing Rules decide where calls and conversations go based on time, intent, location, or queue load.",
    capabilities: ["Priority-ordered rules", "Overflow and after-hours paths"],
    connectsTo: ["Call Queues", "Voice Flows", "Workflows", "Locations"],
  },
  voice_flows: {
    summary:
      "Voice Flows (IVR) define the spoken menu and call path before a caller reaches a queue or AI employee.",
    capabilities: ["Build IVR trees", "Publish flows", "Hand off to queues/agents"],
    connectsTo: ["Call Queues", "Phone Numbers", "AI Employees"],
  },
  integrations: {
    summary: "Integrations connect calendars, CRM, Twilio, Slack, Stripe, and webhooks to AgentDesk.",
    capabilities: ["Connect/disconnect apps", "Sync leads and calendars"],
    connectsTo: ["CRM", "Appointments", "Billing", "Workflows"],
  },
  billing: {
    summary: "Billing shows plan, minute usage, and subscription status for the organization.",
    capabilities: ["View plan usage", "Open invoices", "Manage subscription"],
    connectsTo: ["Invoices", "Analytics"],
  },
  invoices: {
    summary: "Invoices lists billed periods and payment status for your subscription.",
    capabilities: ["Review open/paid invoices"],
    connectsTo: ["Billing"],
  },
  roi: {
    summary: "Analytics / ROI attributes revenue and outcomes to calls, appointments, and AI activity.",
    capabilities: ["Review revenue and ROI %", "Spot conversion trends"],
    connectsTo: ["Calls", "CRM", "Appointments"],
  },
  settings: {
    summary: "Settings holds organization profile, timezone, and account preferences.",
    capabilities: ["Update business profile", "Timezone and defaults"],
    connectsTo: ["Team", "Locations", "Billing"],
  },
  training: {
    summary: "Training runs evaluation jobs that score AI employee accuracy on your FAQs and call scenarios.",
    capabilities: ["Launch training jobs", "Review accuracy scores"],
    connectsTo: ["AI Employees", "Knowledge Base"],
  },
  overview: {
    summary: "The Dashboard overview summarizes KPIs across calls, bookings, and account health.",
    capabilities: ["Scan KPIs", "Jump into any module"],
    connectsTo: ["Calls", "Appointments", "Analytics / ROI"],
  },
};

export function getModuleKnowledge(section: AccountSectionId): ModuleKnowledge | null {
  const meta = SECTION_META.find((m) => m.id === section);
  const body = KNOWLEDGE[section];
  if (!meta || !body) return null;
  return {
    id: section,
    name: meta.label,
    path: meta.path,
    ...body,
  };
}

export const WORKFLOW_TEMPLATES = [
  {
    name: "Missed call follow-up",
    description: "When a call is missed, SMS the caller and create a CRM task.",
  },
  {
    name: "Appointment confirmation",
    description: "After a booking, send confirmation + reminder SMS.",
  },
  {
    name: "New lead qualification",
    description: "On new lead, have an AI employee call/text and update CRM stage.",
  },
  {
    name: "Abandoned call recovery",
    description: "If a queue abandon happens, offer callback or WhatsApp follow-up.",
  },
  {
    name: "Post-call SMS",
    description: "After a completed call, send a summary or survey link.",
  },
  {
    name: "CRM update after call",
    description: "Write disposition and notes into the deal automatically.",
  },
];

export function formatConceptReply(knowledge: ModuleKnowledge, accountLine?: string | null): string {
  return [
    `**${knowledge.name}** — ${knowledge.summary}`,
    "",
    "What you can do:",
    ...knowledge.capabilities.map((c) => `- ${c}`),
    "",
    `Connects to: ${knowledge.connectsTo.join(", ")}.`,
    accountLine ? `\n${accountLine}` : null,
    "",
    `Open **${knowledge.path}** to work with ${knowledge.name.toLowerCase()}.`,
  ]
    .filter((line) => line != null)
    .join("\n");
}

export function formatBuildWorkflowReply(accountLine?: string | null): string {
  return [
    "I can help you build a workflow. Workflows automate follow-up after calls, leads, and appointments.",
    "",
    accountLine ?? null,
    accountLine ? "" : null,
    "What do you want to automate? Pick a common template or describe your trigger:",
    "",
    ...WORKFLOW_TEMPLATES.map((t) => `- **${t.name}** — ${t.description}`),
    "",
    "Suggested steps:",
    "1. Open **/dashboard/workflows** and create a new workflow.",
    "2. Choose a trigger (missed call, new lead, appointment booked, queue abandon).",
    "3. Add conditions (business hours, location, queue).",
    "4. Add actions (SMS, WhatsApp, CRM update, assign teammate, AI follow-up).",
    "5. Save as draft, test, then publish.",
    "",
    "Reply with the outcome you want (for example: “missed call → SMS + CRM task”) and I’ll outline the exact steps.",
  ]
    .filter((line) => line != null)
    .join("\n");
}

/** Step-by-step guide to clone/adapt a workflow the user was just discussing. */
export function formatSimilarWorkflowReply(input: {
  name: string;
  description?: string | null;
  steps?: string | null;
  status?: string | null;
}): string {
  return [
    `Let’s build a **similar workflow** based on **${input.name}**.`,
    "",
    input.description ? `**Reference:** ${input.description}` : null,
    input.steps ? `**Current steps:** ${input.steps}` : null,
    input.status ? `**Status of original:** ${input.status}` : null,
    "",
    "**Build it like this:**",
    "1. Open **/dashboard/workflows** → create a new workflow (or duplicate the existing one if your UI supports clone).",
    "2. Keep the same trigger family (e.g. missed call), or change it if the similar flow should fire on a different event.",
    "3. Copy the action chain — for this pattern that’s typically: notify the caller (SMS/WhatsApp) → create a CRM/task follow-up.",
    "4. Differentiate it with conditions (after-hours only, specific queue/location, VIP leads, etc.).",
    "5. Rename it clearly (e.g. “Missed Call Follow-up — After Hours”).",
    "6. Save as draft, test one run, then publish.",
    "",
    `Tell me what should be different from **${input.name}** (trigger, channel, audience, or timing) and I’ll spell out the exact nodes to add.`,
  ]
    .filter((line) => line != null)
    .join("\n");
}
