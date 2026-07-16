export const VERTICALS = [
  { slug: "restaurant", name: "Restaurants", icon: "🍕" },
  { slug: "clinic", name: "Clinics & Healthcare", icon: "🏥" },
  { slug: "real-estate", name: "Real Estate", icon: "🏠" },
  { slug: "coach", name: "Coaches & Consultants", icon: "💼" },
  { slug: "legal", name: "Legal Firms", icon: "⚖️" },
  { slug: "ecommerce", name: "E-commerce", icon: "🛒" },
  { slug: "saas", name: "SaaS Startups", icon: "🚀" },
] as const;

export const PAIN_POINTS = [
  {
    num: "01",
    title: "Leads Going Cold",
    description:
      "You pay for ads. Leads come in. Nobody calls back in time. 78% of customers buy from whoever responds first — by the time you respond, the deal is already gone.",
  },
  {
    num: "02",
    title: "Too Much Manual Work",
    description:
      "Your team spends 20–40 hours a week on repetitive tasks — answering calls, scheduling, data entry. That's time not spent growing revenue.",
  },
  {
    num: "03",
    title: "Websites That Don't Convert",
    description:
      "Traffic lands on your site, looks around, and leaves. Without a system to capture and qualify visitors instantly, you're losing potential revenue.",
  },
] as const;

export const SYSTEMS = [
  {
    id: "revenue-capture",
    name: "Revenue Capture",
    tagline: "Contact, qualify, and book leads in seconds.",
    features: [
      "AI Voice Agent (24/7)",
      "TCPA-compliant SMS",
      "Instant CRM Sync",
      "Outbound Callbacks",
      "Lead Qualification",
    ],
    priceUsd: 99,
    priceInr: 4999,
    highlight: true,
  },
  {
    id: "web-capture",
    name: "Web Capture",
    tagline: "Turn passive website visitors into qualified leads.",
    features: [
      "High-Converting Landing Pages",
      "Frictionless Lead Capture",
      "Automated SMS Triggers",
      "Embeddable Widgets",
      "Vertical Templates",
    ],
    priceUsd: 49,
    priceInr: 2999,
    highlight: false,
  },
  {
    id: "ops-efficiency",
    name: "Ops Efficiency",
    tagline: "Eliminate 20–40 hours of manual tasks weekly.",
    features: [
      "Webhook Automation Hub",
      "Google Sheets Sync",
      "HubSpot Integration",
      "Follow-up Sequences",
      "Scheduled Retries",
    ],
    priceUsd: 79,
    priceInr: 4999,
    highlight: false,
  },
] as const;

export const SOLUTIONS = [
  {
    slug: "instant-lead-followup",
    name: "Instant Lead Follow-Up",
    category: "AI & Automation",
    description:
      "When a lead submits a form, they instantly receive personalized SMS and AI voice callbacks.",
    priceUsd: 49,
    priceInr: 14999,
  },
  {
    slug: "inbound-receptionist",
    name: "Inbound AI Receptionist",
    category: "AI Voice",
    description:
      "Human-like AI answers every inbound call immediately, routes requests, and schedules meetings 24/7.",
    priceUsd: 99,
    priceInr: 24999,
  },
  {
    slug: "landing-pages",
    name: "High-Converting Landing Pages",
    category: "Web",
    description:
      "A lightning-fast, single-page funnel precision-built to capture leads and book calls.",
    priceUsd: 49,
    priceInr: 14999,
  },
  {
    slug: "appointment-bot",
    name: "Appointment Booking Bot",
    category: "AI & Automation",
    description:
      "Let prospects book themselves automatically across SMS, voice, or web — zero manual scheduling.",
    priceUsd: 79,
    priceInr: 19999,
  },
  {
    slug: "business-audit",
    name: "Business Process Audit",
    category: "Audit & Strategy",
    description:
      "A complete technical audit of your workflows with an exact mapped roadmap for automation.",
    priceUsd: 0,
    priceInr: 0,
    free: true,
  },
] as const;

export const PROCESS_STEPS = [
  {
    num: "01",
    title: "We understand your business",
    description:
      "30-minute call. We learn your business, find where money is leaking, and decide what to build.",
  },
  {
    num: "02",
    title: "We scope & price it",
    description:
      "You get exact deliverables, timeline, and cost in writing. No surprises before or after.",
  },
  {
    num: "03",
    title: "We build it",
    description: "We handle the entire build and setup. You stay focused on your business.",
  },
  {
    num: "04",
    title: "Goes live. You see results.",
    description:
      "System goes live in 2 weeks. You see hours saved and revenue retained within 30 days.",
  },
] as const;

export const STATS = [
  { value: "<5s", label: "SMS Response Time" },
  { value: "<30s", label: "Voice Callback Time" },
  { value: "20+", label: "Hours Saved Weekly" },
  { value: "3x", label: "Average Conversion Lift" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "What exactly do you build?",
    a: "VoiceLead builds AI voice agents, TCPA-compliant SMS follow-up, and high-converting lead capture pages. We connect them to your CRM so every lead is contacted, qualified, and logged automatically.",
  },
  {
    q: "Will I need to replace my existing software?",
    a: "No. VoiceLead integrates with your existing CRM (HubSpot, Google Sheets), phone system (Twilio), and website. We add automation on top — not a replacement.",
  },
  {
    q: "How long does implementation take?",
    a: "Self-serve setup takes under an hour. Our managed onboarding (done-for-you) goes live in 2 weeks with a fixed scope and price.",
  },
  {
    q: "What if the AI gives the wrong information?",
    a: "You control the AI's knowledge through playbooks — menu items, services, FAQs, and business hours. Every call is transcribed and summarized for your review.",
  },
  {
    q: "How do you charge?",
    a: "Monthly SaaS plans starting at $99/mo. Managed setup available from $600 for full done-for-you deployment.",
  },
] as const;

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceUsd: 99,
    priceInr: 4999,
    features: [
      "Inbound AI receptionist",
      "100 outbound callbacks/mo",
      "TCPA-compliant SMS follow-up",
      "1 vertical template",
      "Email notifications",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 199,
    priceInr: 9999,
    popular: true,
    features: [
      "Everything in Starter",
      "500 outbound callbacks/mo",
      "CRM sync (HubSpot, Sheets)",
      "Follow-up sequences",
      "3 vertical templates",
      "Custom landing page",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceUsd: 299,
    priceInr: 14999,
    features: [
      "Everything in Pro",
      "Unlimited callbacks",
      "Managed onboarding",
      "White-label branding",
      "Priority support",
      "Custom integrations",
    ],
  },
] as const;

export type VerticalSlug = (typeof VERTICALS)[number]["slug"];

export interface VerticalDetail {
  slug: VerticalSlug;
  name: string;
  headline: string;
  description: string;
  inboundUseCase: string;
  outboundUseCase: string;
  channels: string[];
  features: string[];
}

export const VERTICAL_DETAILS: Record<VerticalSlug, VerticalDetail> = {
  restaurant: {
    slug: "restaurant",
    name: "Restaurants",
    headline: "Never miss an order or reservation again",
    description:
      "AI answers every call during rush hour, takes orders accurately, and sends structured summaries to your kitchen.",
    inboundUseCase: "Take orders, reservations, answer menu questions",
    outboundUseCase: "Confirm catering enquiries and large orders",
    channels: ["Voice", "SMS"],
    features: ["Order taking", "Allergy capture", "Pickup/delivery time", "Menu-aware AI"],
  },
  clinic: {
    slug: "clinic",
    name: "Clinics & Healthcare",
    headline: "Book appointments while your staff focuses on patients",
    description:
      "AI handles appointment scheduling, triage questions, and follow-up calls so your front desk isn't overwhelmed.",
    inboundUseCase: "Book appointments, answer hours/location, triage urgency",
    outboundUseCase: "Confirm bookings and send reminders via SMS",
    channels: ["Voice", "SMS"],
    features: ["Appointment booking", "Urgency triage", "Insurance FAQs", "Reminder calls"],
  },
  "real-estate": {
    slug: "real-estate",
    name: "Real Estate",
    headline: "Qualify buyers and book showings instantly",
    description:
      "Every property enquiry gets an instant callback. AI qualifies budget, timeline, and preferences before you pick up the phone.",
    inboundUseCase: "Qualify buyers, answer property questions, book showings",
    outboundUseCase: "Instant callback on listing enquiries",
    channels: ["Voice", "SMS", "CRM"],
    features: ["Buyer qualification", "Showing scheduler", "CRM sync", "Budget/timeline capture"],
  },
  coach: {
    slug: "coach",
    name: "Coaches & Consultants",
    headline: "Fill your calendar without chasing leads",
    description:
      "AI calls back every discovery call request, qualifies fit, and books sessions on your calendar.",
    inboundUseCase: "Answer enquiries, explain programs, book discovery calls",
    outboundUseCase: "Instant callback on coaching enquiry forms",
    channels: ["Voice", "Email"],
    features: ["Discovery call booking", "Program FAQs", "Calendar integration", "Lead scoring"],
  },
  legal: {
    slug: "legal",
    name: "Legal Firms",
    headline: "Capture every intake call, even after hours",
    description:
      "AI handles initial client intake, assesses case urgency, and captures details for your paralegal to review.",
    inboundUseCase: "Client intake, urgency assessment, schedule consultations",
    outboundUseCase: "Follow up on contact form submissions",
    channels: ["Voice", "Email"],
    features: ["Client intake", "Urgency triage", "Practice area routing", "Consultation booking"],
  },
  ecommerce: {
    slug: "ecommerce",
    name: "E-commerce",
    headline: "Recover abandoned enquiries and support customers 24/7",
    description:
      "AI handles order status, returns, and product questions — plus calls back visitors who filled forms but didn't buy.",
    inboundUseCase: "Order status, returns, product questions",
    outboundUseCase: "Recover abandoned form submissions",
    channels: ["SMS", "Voice"],
    features: ["Order tracking", "Return initiation", "Product FAQs", "Cart recovery"],
  },
  saas: {
    slug: "saas",
    name: "SaaS Startups",
    headline: "Demo requests answered in seconds, not hours",
    description:
      "AI qualifies demo requests, answers product questions, and books calls with your sales team instantly.",
    inboundUseCase: "Product questions, demo scheduling, pricing enquiries",
    outboundUseCase: "Instant callback on trial signups and demo requests",
    channels: ["Voice", "Email"],
    features: ["Demo scheduling", "Product FAQs", "Lead qualification", "CRM sync"],
  },
};
