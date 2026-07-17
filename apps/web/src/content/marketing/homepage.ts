export const ANNOUNCEMENT = {
  text: "New: Build and deploy AI employees across voice, SMS, WhatsApp, and chat.",
  ctaLabel: "Explore AI Employee Builder",
  ctaHref: "/#ai-employees",
};

export const HERO = {
  eyebrow: "AI Workforce Platform for Modern Businesses",
  title: "Build an AI workforce that answers, sells, supports, and schedules 24/7.",
  description:
    "Create AI receptionists, sales agents, support agents, and schedulers that work across phone, SMS, WhatsApp, chat, and CRM—without adding headcount.",
  primaryCta: { label: "Start Free Trial", href: "/signup" },
  secondaryCta: { label: "Book a Demo", href: "/audit" },
  trustNotes: [
    "No credit card required",
    "Launch in minutes",
    "Human handoff included",
    "Cancel anytime",
  ],
};

export const TRUST = {
  title: "Built for growing teams across service industries",
  description:
    "AgentDesk AI helps small businesses, multi-location operators, and contact-center teams run customer conversations with configurable AI employees.",
  pillars: [
    { label: "Tenant isolation", detail: "Org-scoped data and role-based access" },
    { label: "Human handoff", detail: "Transfer, queue, or callback when needed" },
    { label: "Omnichannel", detail: "Phone, SMS, WhatsApp, chat, and CRM context" },
    { label: "Outcome metrics", detail: "Leads, appointments, resolution, and ROI" },
  ],
};

export const OUTCOMES = [
  {
    title: "Answer every call",
    description: "Respond instantly during peaks, lunch rushes, and after hours.",
  },
  {
    title: "Qualify leads instantly",
    description: "Ask the right questions and route hot opportunities to your team.",
  },
  {
    title: "Book and manage appointments",
    description: "Check availability, schedule, reschedule, and confirm automatically.",
  },
  {
    title: "Route callers to the right person",
    description: "Use departments, skills, and escalation rules—not guesswork.",
  },
  {
    title: "Resolve common support questions",
    description: "Use your knowledge base to handle repetitive inquiries consistently.",
  },
  {
    title: "Send automated follow-ups",
    description: "Confirm by SMS, recover missed calls, and keep leads warm.",
  },
  {
    title: "Update CRM records",
    description: "Log conversations, create tasks, and keep the pipeline accurate.",
  },
  {
    title: "Run after-hours operations",
    description: "Capture requests overnight so mornings start with booked work.",
  },
] as const;

export const AI_EMPLOYEES = [
  {
    id: "receptionist",
    title: "AI Receptionist",
    description: "Answers calls, routes customers, takes messages, and books appointments.",
    popular: true,
    tone: "violet",
    initials: "AR",
    avatarSrc: "/marketing/avatars/ai-receptionist-v2.jpg",
    href: "/audit",
    capabilities: [
      "Answer & route calls 24/7",
      "Take messages & recordings",
      "Escalate to human when needed",
    ],
  },
  {
    id: "sales",
    title: "AI Sales Agent",
    description: "Qualifies leads, explains offerings, and books sales meetings automatically.",
    popular: true,
    tone: "emerald",
    initials: "AS",
    avatarSrc: "/marketing/avatars/ai-sales-v2.jpg",
    href: "/audit",
    capabilities: [
      "Qualify & capture leads",
      "Explain services & pricing",
      "Book meetings & follow up",
    ],
  },
  {
    id: "appointment",
    title: "AI Appointment Setter",
    description: "Checks availability, schedules, reschedules, and sends confirmations.",
    popular: false,
    tone: "sky",
    initials: "AA",
    avatarSrc: "/marketing/avatars/ai-appointment-v2.jpg",
    href: "/audit",
    capabilities: [
      "Real-time availability check",
      "Schedule & reschedule appointments",
      "Automated reminders & alerts",
    ],
  },
  {
    id: "support",
    title: "AI Support Agent",
    description: "Resolves common issues, guides users, and creates tickets when needed.",
    popular: false,
    tone: "orange",
    initials: "SU",
    avatarSrc: "/marketing/avatars/ai-support-v2.jpg",
    href: "/audit",
    capabilities: [
      "Answer FAQs instantly",
      "Troubleshoot & guide users",
      "Create & update tickets",
    ],
  },
  {
    id: "billing",
    title: "AI Billing Assistant",
    description: "Handles payment questions, invoice status, and billing follow-ups.",
    popular: false,
    tone: "teal",
    initials: "BI",
    avatarSrc: "/marketing/avatars/ai-billing-v2.jpg",
    href: "/audit",
    capabilities: [
      "Payment status & invoices",
      "Payment links & reminders",
      "Escalate complex issues",
    ],
  },
  {
    id: "collections",
    title: "AI Collections Agent",
    description: "Sends payment reminders, negotiates plans, and tracks outstanding balances.",
    popular: false,
    tone: "rose",
    initials: "CO",
    avatarSrc: "/marketing/avatars/ai-collections-v2.jpg",
    href: "/audit",
    capabilities: [
      "Payment reminders",
      "Negotiate & set up plans",
      "Track & update records",
    ],
  },
  {
    id: "property",
    title: "AI Property Manager",
    description: "Handles maintenance requests, tenant communication, and rent reminders.",
    popular: false,
    tone: "blue",
    initials: "PM",
    avatarSrc: "/marketing/avatars/ai-property-v2.jpg",
    href: "/audit",
    capabilities: [
      "Maintenance request intake",
      "Tenant communication",
      "Rent reminders & updates",
    ],
  },
  {
    id: "after-hours",
    title: "AI After-Hours Agent",
    description: "Covers nights and weekends, triages urgent issues, and notifies your team.",
    popular: false,
    tone: "indigo",
    initials: "AH",
    avatarSrc: "/marketing/avatars/ai-after-hours-v2.jpg",
    href: "/audit",
    capabilities: [
      "After-hours call handling",
      "Urgent issue triage",
      "Notify team & follow up",
    ],
  },
] as const;

export const AI_EMPLOYEES_CUSTOM_CTA = {
  title: "Need something unique?",
  description:
    "Create a custom AI employee tailored to your business processes and workflows.",
  ctaLabel: "Create Custom AI Employee",
  href: "/signup",
} as const;

export const HOW_IT_WORKS_SECTION = {
  eyebrow: "Simple, powerful, and built for results",
  title: "How AgentDesk AI Works",
  description:
    "Launch your AI workforce in minutes and transform every customer conversation into a growth opportunity.",
  loopBadge: "Everything is tracked and optimized for better results",
} as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Connect Your Business",
    description:
      "Add your phone numbers, website, knowledge sources, team, and the tools you already use.",
    bullets: ["Phone & Channels", "Knowledge & Documents", "Integrations"],
  },
  {
    step: 2,
    title: "Build Your AI Employees",
    description:
      "Choose roles, customize personalities, voices, workflows, and escalation rules to match your business.",
    bullets: ["Pick a Role", "Configure Workflows", "Set Guardrails & Escalations"],
  },
  {
    step: 3,
    title: "Test & Launch",
    description:
      "Test conversations in real-time, fine-tune responses, and publish when you're ready.",
    bullets: ["Simulate Conversations", "Review & Optimize", "Go Live Instantly"],
  },
  {
    step: 4,
    title: "Monitor & Improve",
    description:
      "Track performance, analyze insights, and continuously optimize your AI workforce.",
    bullets: ["Real-time Analytics", "Performance Insights", "Continuous Improvement"],
  },
] as const;

export const WORKFLOW_PIPELINE = [
  {
    id: "calls",
    title: "Customer Calls",
    description: "Customer calls your business or sends a message.",
    tone: "sky",
  },
  {
    id: "understands",
    title: "AI Understands",
    description: "AI employee understands intent using advanced natural language AI.",
    tone: "violet",
  },
  {
    id: "action",
    title: "Answers or Takes Action",
    description: "AI answers questions, qualifies leads, books appointments, or solves the issue.",
    tone: "emerald",
  },
  {
    id: "transfer",
    title: "Transfers When Needed",
    description: "Seamless handoff to the right human or department when necessary.",
    tone: "orange",
  },
  {
    id: "updates",
    title: "Updates Your Tools",
    description: "Updates CRM, calendars, and tools automatically.",
    tone: "blue",
  },
  {
    id: "followup",
    title: "Follows Up",
    description: "Sends confirmations, reminders, or follow-ups via SMS, email, or WhatsApp.",
    tone: "indigo",
  },
] as const;

export const HOW_IT_WORKS_VALUE_PROPS = [
  {
    id: "launch",
    title: "Launch in Minutes",
    description: "Get your first AI employee up and running fast.",
  },
  {
    id: "nocode",
    title: "No Coding Required",
    description: "Everything is visual, simple, and intuitive.",
  },
  {
    id: "human",
    title: "Human in the Loop",
    description: "AI handles the routine, humans handle the rest.",
  },
  {
    id: "enterprise",
    title: "Enterprise Ready",
    description: "Secure, compliant, and built for scale.",
  },
  {
    id: "results",
    title: "Results That Grow",
    description: "More leads, more bookings, more revenue.",
  },
] as const;

export const CHANNELS = [
  { name: "Phone", detail: "Inbound and outbound voice" },
  { name: "SMS", detail: "Reminders and campaigns" },
  { name: "WhatsApp", detail: "Conversational automation" },
  { name: "Web chat", detail: "On-site support" },
  { name: "Email", detail: "Threaded follow-ups" },
  { name: "CRM", detail: "Shared customer context" },
] as const;

export const HANDOFF = {
  title: "AI when it can help. Humans when they are needed.",
  description:
    "AgentDesk AI is built for responsible automation—confident handling of routine work, with clear paths to people for exceptions, emergencies, and sensitive topics.",
  points: [
    "Live call transfer and department routing",
    "Escalation rules and confidence thresholds",
    "Emergency and sensitive-topic restrictions",
    "Call queues and human takeover",
    "Whisper and coaching for supervisors",
    "Callback creation when nobody is available",
  ],
};

export const ANALYTICS_METRICS = [
  "Calls handled",
  "Answer rate",
  "Leads captured",
  "Appointments booked",
  "Resolution rate",
  "Escalation rate",
  "Revenue attributed",
  "Cost savings",
  "Conversion rate",
  "Customer satisfaction",
] as const;

export const ANALYTICS_SECTION = {
  eyebrow: "Analytics & ROI",
  title: "See exactly how your AI workforce is performing",
  description:
    "Track calls, leads, appointments, and revenue in real time. Understand your ROI and make data-driven decisions that grow your business.",
  primaryCta: { label: "View Full Analytics", href: "/signup" },
  secondaryCta: { label: "Book a Demo", href: "/audit" },
  highlightMetrics: [
    {
      id: "calls",
      label: "Calls Answered",
      value: "2,847",
      change: "+24.5%",
      tone: "violet",
    },
    {
      id: "appointments",
      label: "Appointments Booked",
      value: "156",
      change: "+32.1%",
      tone: "indigo",
    },
    {
      id: "leads",
      label: "Leads Captured",
      value: "423",
      change: "+18.7%",
      tone: "sky",
    },
    {
      id: "response",
      label: "Response Time",
      value: "28s",
      change: "-42%",
      tone: "blue",
      improvedDown: true,
    },
    {
      id: "revenue",
      label: "Revenue Generated",
      value: "$28,540",
      change: "+27.4%",
      tone: "emerald",
    },
    {
      id: "cost",
      label: "Cost Saved",
      value: "$12,850",
      change: "+35%",
      tone: "teal",
    },
  ],
  pillars: [
    {
      title: "Real-time Insights",
      description: "Track performance as it happens",
    },
    {
      title: "Measure ROI",
      description: "See the impact on your bottom line",
    },
    {
      title: "Data-Driven Decisions",
      description: "Make smarter moves for growth",
    },
    {
      title: "Built for Scale",
      description: "From single location to enterprise",
    },
  ],
  bannerTitle: "Turn conversations into measurable business growth",
  disclaimer: "Illustrative dashboard preview — sample metrics, not a verified performance claim.",
} as const;

export const SECURITY_POINTS = [
  {
    title: "Tenant data isolation",
    description: "Organization-scoped access so teams only see their own data.",
  },
  {
    title: "Role-based access",
    description: "Owners, admins, agents, and viewers get the right permissions.",
  },
  {
    title: "Encryption in transit and at rest",
    description: "Protect customer conversations and business records by default.",
  },
  {
    title: "Audit logs",
    description: "Track meaningful platform and administrative activity.",
  },
  {
    title: "Configurable retention",
    description: "Control how long recordings and conversation data are kept.",
  },
  {
    title: "Secure integrations",
    description: "Connect calendars, CRMs, and messaging with least-privilege patterns.",
  },
  {
    title: "Recording controls",
    description: "Manage when calls are recorded and who can review them.",
  },
  {
    title: "Compliance-ready architecture",
    description:
      "Designed with security best practices and compliance-ready controls—without claiming unfinished certifications.",
  },
] as const;

export const USE_CASES = [
  {
    title: "Insurance agency after-hours quotes",
    before: "Quote requests after 5pm wait until morning and go cold.",
    workflow: "AI Sales Agent qualifies the request, books a consult, and updates CRM.",
    outcome: "Leads are captured overnight with a next-day follow-up already scheduled.",
  },
  {
    title: "HVAC emergency scheduling",
    before: "Urgent calls hit voicemail while technicians are on job sites.",
    workflow: "AI Receptionist triages urgency, books a window, and notifies dispatch.",
    outcome: "Fewer missed emergencies and clearer job intake for the field team.",
  },
  {
    title: "Dental office scheduling load",
    before: "Staff spend peak hours on repetitive booking and insurance questions.",
    workflow: "AI Appointment Setter handles routine scheduling and FAQs.",
    outcome: "Front desk focuses on in-office patients while openings stay filled.",
  },
  {
    title: "Property maintenance routing",
    before: "Tenants struggle to reach the right manager for maintenance issues.",
    workflow: "AI Support Agent classifies requests and routes by property and urgency.",
    outcome: "Faster acknowledgment and cleaner handoffs to on-call staff.",
  },
  {
    title: "Auto shop status calls",
    before: "Advisors miss status calls while working in the bay.",
    workflow: "AI Receptionist shares status FAQs and books pickup appointments.",
    outcome: "Customers get answers without interrupting technicians mid-job.",
  },
] as const;

export const FINAL_CTA = {
  title: "Build your AI workforce today.",
  description:
    "Launch your first AI employee, connect your business tools, and start handling customer conversations 24/7.",
  primaryCta: { label: "Start Free Trial", href: "/signup" },
  secondaryCta: { label: "Book a Demo", href: "/audit" },
  enterpriseCta: { label: "Talk to Sales", href: "/audit?intent=sales" },
};

export const INDUSTRY_HOME_CARDS = [
  {
    slug: "insurance",
    name: "Insurance",
    callTypes: "Quotes, claims questions, policy reviews",
    automation: "Lead capture, consult booking, CRM follow-up",
    result: "Fewer missed after-hours opportunities",
  },
  {
    slug: "home-services",
    name: "Home services",
    callTypes: "Emergencies, estimates, job scheduling",
    automation: "Triage, dispatch routing, SMS confirmation",
    result: "Faster response when speed wins the job",
  },
  {
    slug: "dental",
    name: "Dental and healthcare",
    callTypes: "New patients, reschedules, insurance FAQs",
    automation: "Appointment setting and after-hours intake",
    result: "Less repetitive front-desk load",
  },
  {
    slug: "auto-repair",
    name: "Auto repair",
    callTypes: "Service booking, status, estimates",
    automation: "Status FAQs and pickup scheduling",
    result: "Advisors stay focused on the bay",
  },
  {
    slug: "property-management",
    name: "Property management",
    callTypes: "Maintenance, leasing, emergencies",
    automation: "Request routing by property and urgency",
    result: "Clearer handoffs to on-call staff",
  },
  {
    slug: "law",
    name: "Legal",
    callTypes: "Intake, consult booking, case status",
    automation: "Qualification and calendar booking",
    result: "Consistent first response for new matters",
  },
  {
    slug: "real-estate",
    name: "Real estate",
    callTypes: "Showing requests, buyer/seller questions",
    automation: "Lead qualification and meeting booking",
    result: "Faster follow-up on inbound interest",
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    callTypes: "Reservations, hours, takeout questions",
    automation: "Busy-period answering and message capture",
    result: "Fewer missed calls during service rushes",
  },
  {
    slug: "multi-location",
    name: "Multi-location businesses",
    callTypes: "Location-specific hours, booking, routing",
    automation: "Per-location knowledge and call distribution",
    result: "One platform to operate every site",
  },
] as const;
