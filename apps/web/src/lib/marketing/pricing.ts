/**
 * Display pricing only — Stripe price IDs live server-side in env.
 * Never treat these values as billing authority.
 */
export type PricingPlan = {
  id: "starter" | "professional" | "business";
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  minutesIncluded: number;
  phoneNumbers: number;
  aiAgents: number;
  teamMembers: number;
  locations: number;
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
    description: "For solo operators getting started with AI answering.",
    monthlyPriceUsd: 79,
    annualPriceUsd: 63,
    minutesIncluded: 500,
    phoneNumbers: 1,
    aiAgents: 1,
    teamMembers: 3,
    locations: 1,
    overagePerMinuteUsd: 0.12,
    supportLevel: "Email",
    trialDays: 14,
    features: [
      "500 AI minutes / month",
      "1 phone number",
      "1 AI agent",
      "Basic routing",
      "Call transcripts & summaries",
      "Email support",
    ],
    stripePriceEnvMonthly: "STRIPE_PRICE_STARTER",
    stripePriceEnvAnnual: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need routing, booking, and analytics.",
    monthlyPriceUsd: 199,
    annualPriceUsd: 159,
    minutesIncluded: 2500,
    phoneNumbers: 5,
    aiAgents: 3,
    teamMembers: 15,
    locations: 3,
    overagePerMinuteUsd: 0.1,
    supportLevel: "Priority email + chat",
    trialDays: 14,
    popular: true,
    features: [
      "2,500 AI minutes / month",
      "5 phone numbers",
      "3 AI agents",
      "Advanced routing rules",
      "Appointments & lead capture",
      "Integrations",
      "Analytics dashboard",
      "Priority support",
    ],
    stripePriceEnvMonthly: "STRIPE_PRICE_PROFESSIONAL",
    stripePriceEnvAnnual: "STRIPE_PRICE_PROFESSIONAL_ANNUAL",
  },
  {
    id: "business",
    name: "Business",
    description: "For multi-location operators with advanced workflows.",
    monthlyPriceUsd: 449,
    annualPriceUsd: 359,
    minutesIncluded: 8000,
    phoneNumbers: 20,
    aiAgents: 10,
    teamMembers: 50,
    locations: 15,
    overagePerMinuteUsd: 0.08,
    supportLevel: "Dedicated success",
    trialDays: 14,
    features: [
      "8,000 AI minutes / month",
      "20 phone numbers",
      "10 AI agents",
      "Multi-location management",
      "Custom routing & escalations",
      "SSO-ready security controls",
      "Advanced analytics & exports",
      "Dedicated support",
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
