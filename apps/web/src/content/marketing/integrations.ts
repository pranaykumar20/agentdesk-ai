export type IntegrationId =
  | "google-calendar"
  | "microsoft-365"
  | "hubspot"
  | "salesforce"
  | "twilio"
  | "retell"
  | "stripe"
  | "slack"
  | "zapier"
  | "quickbooks"
  | "mailchimp"
  | "webhooks";

export type IntegrationItem = {
  id: IntegrationId;
  name: string;
  category: string;
  description?: string;
};

export const INTEGRATIONS: IntegrationItem[] = [
  { id: "google-calendar", name: "Google Calendar", category: "Scheduling" },
  { id: "microsoft-365", name: "Microsoft 365", category: "Productivity" },
  { id: "hubspot", name: "HubSpot", category: "CRM" },
  { id: "salesforce", name: "Salesforce", category: "CRM" },
  { id: "twilio", name: "Twilio", category: "Communications" },
  { id: "retell", name: "Retell", category: "Voice" },
  { id: "stripe", name: "Stripe", category: "Billing" },
  { id: "slack", name: "Slack", category: "Collaboration" },
  { id: "zapier", name: "Zapier", category: "Automation" },
  { id: "quickbooks", name: "QuickBooks", category: "Finance" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing" },
  { id: "webhooks", name: "Custom webhooks", category: "Developer" },
];

/** Featured integrations for the homepage carousel (order matches design). */
export const FEATURED_INTEGRATIONS: Array<
  IntegrationItem & { description: string }
> = [
  {
    id: "twilio",
    name: "Twilio",
    category: "Communications",
    description: "Voice, SMS & WhatsApp",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Scheduling",
    description: "Schedule & manage appointments",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "CRM & marketing automation",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "CRM & customer data sync",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Collaboration",
    description: "Notifications & team collaboration",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Finance",
    description: "Invoices & payment management",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Billing",
    description: "Payments & subscriptions",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automation",
    description: "Connect thousands of apps",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    category: "Productivity",
    description: "Email, calendar & Teams",
  },
];

export const INTEGRATIONS_SECTION = {
  eyebrow: "Connect & automate",
  title: "Integrate with the tools you already use",
  description:
    "Seamlessly connect AgentDesk AI with your favorite business applications. Build powerful workflows and automate everything.",
  trustTitle: "Secure. Reliable. Built for scale.",
  trustDetail: "256-bit encryption, SOC 2 ready, and 99.99% uptime.",
} as const;
