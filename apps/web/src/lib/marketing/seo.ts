import { HOMEPAGE_FAQ } from "@/content/marketing/faq";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agentdesk.ai";

export function getSiteUrl() {
  return SITE_URL.replace(/\/$/, "");
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AgentDesk AI",
    url: getSiteUrl(),
    description:
      "AI Workforce Operating System for businesses—create, train, deploy, and manage AI employees across phone, SMS, WhatsApp, chat, and CRM.",
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AgentDesk AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Create AI receptionists, sales agents, support agents and schedulers that work across phone, SMS, WhatsApp, chat and CRM.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free trial available",
    },
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
