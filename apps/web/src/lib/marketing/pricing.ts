/**
 * Display pricing only — Stripe price IDs live server-side in env.
 * Never treat these values as billing authority.
 */
export type PricingPlan = {
  id: "starter" | "professional" | "business";
  name: string;
  description: string;
  /** One-line product promise shown on pricing cards. */
  corePromise: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  minutesIncluded: number;
  phoneNumbers: number;
  aiAgents: number;
  teamMembers: number;
  locations: number;
  knowledgeDocuments: number;
  overagePerMinuteUsd: number;
  supportLevel: string;
  trialDays: number;
  popular?: boolean;
  features: string[];
  stripePriceEnvMonthly: string;
  stripePriceEnvAnnual: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description:
      "For solo operators and single-location businesses that need AI call answering.",
    corePromise: "Stop missing calls with a 24/7 AI receptionist.",
    monthlyPriceUsd: 79,
    annualPriceUsd: 63,
    minutesIncluded: 500,
    phoneNumbers: 1,
    aiAgents: 1,
    teamMembers: 3,
    locations: 1,
    knowledgeDocuments: 25,
    overagePerMinuteUsd: 0.12,
    supportLevel: "Email",
    trialDays: 14,
    features: [
      "500 AI minutes / month",
      "1 phone number",
      "1 AI employee",
      "3 team members",
      "1 location",
      "25 knowledge documents / FAQs",
      "24/7 AI Receptionist",
      "Basic call handling",
      "Call transcripts & summaries",
      "Basic appointments",
      "Basic lead capture",
      "Basic knowledge base",
      "Basic routing rules",
      "Basic analytics dashboard",
      "Human handoff",
      "Email support",
    ],
    stripePriceEnvMonthly: "STRIPE_PRICE_STARTER",
    stripePriceEnvAnnual: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "For growing teams that need appointments, lead capture, routing, CRM, and follow-up automation.",
    corePromise: "Turn calls into booked appointments and qualified leads.",
    monthlyPriceUsd: 199,
    annualPriceUsd: 159,
    minutesIncluded: 2500,
    phoneNumbers: 5,
    aiAgents: 3,
    teamMembers: 15,
    locations: 3,
    knowledgeDocuments: 250,
    overagePerMinuteUsd: 0.1,
    supportLevel: "Priority email + chat",
    trialDays: 14,
    popular: true,
    features: [
      "Everything in Starter",
      "2,500 AI minutes / month",
      "5 phone numbers",
      "3 AI employees",
      "15 team members",
      "3 locations",
      "250 knowledge documents / FAQs",
      "Multiple AI employees",
      "AI Appointment Setter",
      "AI Sales/Lead Agent",
      "Advanced routing rules",
      "Appointments & lead capture",
      "CRM & Pipeline",
      "Contact Center",
      "Call Queues",
      "SMS follow-ups",
      "Integrations",
      "Marketplace templates",
      "Training Center basic",
      "Advanced analytics",
      "CSV analytics export",
      "Priority email + chat support",
    ],
    stripePriceEnvMonthly: "STRIPE_PRICE_PROFESSIONAL",
    stripePriceEnvAnnual: "STRIPE_PRICE_PROFESSIONAL_ANNUAL",
  },
  {
    id: "business",
    name: "Business",
    description:
      "For multi-location and high-volume operators running an AI workforce across teams, channels, and workflows.",
    corePromise: "Operate a complete AI workforce across locations and customer channels.",
    monthlyPriceUsd: 449,
    annualPriceUsd: 359,
    minutesIncluded: 8000,
    phoneNumbers: 20,
    aiAgents: 10,
    teamMembers: 50,
    locations: 15,
    knowledgeDocuments: 1000,
    overagePerMinuteUsd: 0.08,
    supportLevel: "Dedicated success",
    trialDays: 14,
    features: [
      "Everything in Professional",
      "8,000 AI minutes / month",
      "20 phone numbers",
      "10 AI employees",
      "50 team members",
      "15 locations",
      "1,000 knowledge documents / FAQs",
      "Multi-location management",
      "Advanced AI Employee Builder",
      "Advanced Workflow Builder",
      "Advanced Voice Flow Designer",
      "Live Call Monitor",
      "Listen / whisper / barge controls",
      "Advanced Contact Center",
      "Advanced Call Queues",
      "WhatsApp automation",
      "SMS campaigns",
      "Revenue & ROI dashboard",
      "Advanced Training Center",
      "Custom routing & escalations",
      "Advanced analytics exports",
      "Custom integrations/webhooks",
      "SSO-ready security controls",
      "Dedicated success support",
    ],
    stripePriceEnvMonthly: "STRIPE_PRICE_BUSINESS",
    stripePriceEnvAnnual: "STRIPE_PRICE_BUSINESS_ANNUAL",
  },
];

export const PRICING_FAQ = [
  {
    question: "Is there a free trial?",
    answer: "Yes. Every plan includes a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What happens if I go over my minutes?",
    answer:
      "Overage is billed per minute at your plan’s overage rate. You can set usage alerts in Settings.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes. Upgrade or downgrade anytime. Changes prorate through Stripe billing.",
  },
  {
    question: "Do you offer annual billing?",
    answer: "Yes. Annual billing saves about 20% compared to monthly.",
  },
  {
    question: "Is pricing the same for every industry?",
    answer:
      "Yes. AgentDesk AI is industry-neutral. Industry templates customize your agent—not your plan price.",
  },
] as const;
