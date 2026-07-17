export type NavLink = { label: string; href: string; description?: string };

export type NavGroup = {
  id: string;
  label: string;
  href?: string;
  items?: NavLink[];
};

/**
 * Lean primary nav — fewer top-level items so the header stays readable.
 * Secondary destinations live inside Product / Solutions / Resources dropdowns.
 */
export const MARKETING_NAV: NavGroup[] = [
  {
    id: "product",
    label: "Product",
    items: [
      {
        label: "AI Employees",
        href: "/#ai-employees",
        description: "Receptionists, sales, support, and more.",
      },
      {
        label: "AI Receptionist",
        href: "/#ai-employees",
        description: "Answer calls, take messages, and route customers.",
      },
      {
        label: "Workflow Builder",
        href: "/#platform",
        description: "Automate follow-ups, CRM updates, and handoffs.",
      },
      {
        label: "Contact Center",
        href: "/#omnichannel",
        description: "Phone, SMS, WhatsApp, and chat in one place.",
      },
      {
        label: "Analytics and ROI",
        href: "/#analytics",
        description: "Measure outcomes, not only call minutes.",
      },
      {
        label: "Integrations",
        href: "/integrations",
        description: "Connect calendars, CRMs, and messaging tools.",
      },
      {
        label: "Features overview",
        href: "/features",
        description: "See the full platform capability list.",
      },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    items: [
      {
        label: "Answer every call",
        href: "/#outcomes",
        description: "Never miss a lead during peaks or after hours.",
      },
      {
        label: "Automate appointment booking",
        href: "/#outcomes",
        description: "Schedule, reschedule, and confirm automatically.",
      },
      {
        label: "Qualify leads",
        href: "/#outcomes",
        description: "Capture intent and route hot opportunities.",
      },
      {
        label: "Human handoff",
        href: "/#handoff",
        description: "Transfer to the right person when needed.",
      },
      {
        label: "Industries",
        href: "/industries",
        description: "Templates for dental, legal, home services, and more.",
      },
      {
        label: "Multi-location teams",
        href: "/#industries",
        description: "Route callers by location and department.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { label: "Book a demo", href: "/audit", description: "Talk with our team about your workflow." },
      { label: "Security", href: "/security", description: "Isolation, access control, and retention." },
      { label: "Help Center", href: "/audit", description: "Get answers and onboarding support." },
      { label: "About", href: "/#final-cta", description: "What AgentDesk AI is built for." },
      { label: "Contact", href: "/audit", description: "Reach sales or partnership inquiries." },
      { label: "Privacy", href: "/security#privacy" },
      { label: "Terms", href: "/security#terms" },
    ],
  },
];

export const FOOTER_COLUMNS: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Product",
    links: [
      { label: "AI Receptionist", href: "/#ai-employees" },
      { label: "AI Employee Builder", href: "/#ai-employees" },
      { label: "Workflow Builder", href: "/#platform" },
      { label: "Contact Center", href: "/#omnichannel" },
      { label: "CRM", href: "/#platform" },
      { label: "Analytics", href: "/#analytics" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Sales", href: "/#outcomes" },
      { label: "Customer Support", href: "/#ai-employees" },
      { label: "Appointment Scheduling", href: "/#outcomes" },
      { label: "Multi-location", href: "/#industries" },
      { label: "After-hours", href: "/#ai-employees" },
      { label: "Lead Qualification", href: "/#outcomes" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Insurance", href: "/industries#insurance" },
      { label: "Home Services", href: "/industries#home-services" },
      { label: "Healthcare", href: "/industries#medical" },
      { label: "Auto", href: "/industries#auto-repair" },
      { label: "Property Management", href: "/industries#property-management" },
      { label: "Legal", href: "/industries#law" },
      { label: "Real Estate", href: "/industries#real-estate" },
      { label: "Restaurants", href: "/industries#restaurants" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/audit" },
      { label: "Features", href: "/features" },
      { label: "Integrations", href: "/integrations" },
      { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
      { label: "Book a demo", href: "/audit" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#final-cta" },
      { label: "Contact", href: "/audit" },
      { label: "Privacy", href: "/security#privacy" },
      { label: "Terms", href: "/security#terms" },
      { label: "Security", href: "/security" },
      { label: "Log in", href: "/login" },
    ],
  },
];
