export type PlatformCapability = {
  id: string;
  title: string;
  description: string;
};

export type PlatformGroup = {
  id: "build" | "automate" | "communicate" | "manage" | "measure";
  label: string;
  summary: string;
  capabilities: PlatformCapability[];
};

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    id: "build",
    label: "Build",
    summary: "Create AI employees with the knowledge, voice, and permissions your business needs.",
    capabilities: [
      {
        id: "employee-builder",
        title: "AI Employee Builder",
        description: "Define roles, personality, knowledge sources, skills, and publish versions.",
      },
      {
        id: "voice-flow",
        title: "AI Voice Flow Designer",
        description: "Design conversational voice logic with intents, branches, and transfers.",
      },
      {
        id: "knowledge",
        title: "Knowledge Importer",
        description: "Bring in documents and website content so answers stay consistent.",
      },
      {
        id: "training",
        title: "AI Training Center",
        description: "Run training jobs, evaluate quality, and improve response accuracy over time.",
      },
    ],
  },
  {
    id: "automate",
    label: "Automate",
    summary: "Connect conversations to workflows that update CRM, notify teams, and follow up.",
    capabilities: [
      {
        id: "workflows",
        title: "Workflow Builder",
        description: "Trigger actions from calls, forms, appointments, and CRM events.",
      },
      {
        id: "crm",
        title: "CRM and Lead Pipeline",
        description: "Capture leads, move deals, and keep ownership clear across the team.",
      },
      {
        id: "sms",
        title: "SMS Campaigns",
        description: "Send reminders, promos, and re-engagement messages with measurable results.",
      },
      {
        id: "whatsapp",
        title: "WhatsApp Automation",
        description: "Automate WhatsApp conversations, broadcasts, and support workflows.",
      },
    ],
  },
  {
    id: "communicate",
    label: "Communicate",
    summary: "Meet customers on the channels they already use—with shared context.",
    capabilities: [
      {
        id: "contact-center",
        title: "Customer Contact Center",
        description: "A unified inbox for phone, SMS, WhatsApp, email, and web chat.",
      },
      {
        id: "queues",
        title: "Call Queue Management",
        description: "Balance wait times, service levels, and agent distribution.",
      },
      {
        id: "live-monitor",
        title: "Live Call Monitor",
        description: "Watch active calls and use listen, whisper, and barge when needed.",
      },
      {
        id: "handoff",
        title: "Human handoff",
        description: "Transfer, escalate, or create callbacks based on your rules.",
      },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    summary: "Operate across teams and locations with clear controls.",
    capabilities: [
      {
        id: "locations",
        title: "Multi-location Management",
        description: "Hours, numbers, routing, and performance by location.",
      },
      {
        id: "integrations",
        title: "Integrations",
        description: "Connect calendars, CRMs, messaging, and custom webhooks.",
      },
      {
        id: "admin",
        title: "Super Admin controls",
        description: "Enterprise-ready tenant, flag, and health visibility for platform operators.",
      },
      {
        id: "marketplace",
        title: "Agent Marketplace",
        description: "Start faster with installable AI employee templates for common industries.",
      },
    ],
  },
  {
    id: "measure",
    label: "Measure",
    summary: "Understand business outcomes—leads, appointments, resolution, and ROI.",
    capabilities: [
      {
        id: "roi",
        title: "Revenue and ROI Dashboard",
        description: "Attribute revenue and cost savings to AI-powered operations.",
      },
      {
        id: "analytics",
        title: "Conversation analytics",
        description: "Track answer rate, escalations, dispositions, and CSAT trends.",
      },
      {
        id: "quality",
        title: "Quality review",
        description: "Use transcripts, summaries, and coaching workflows to improve.",
      },
    ],
  },
];
