import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero/HeroSection";
import { TrustedBySection } from "@/components/marketing/social-proof/TrustedBySection";
import { OutcomesSection } from "@/components/marketing/outcomes/OutcomesSection";
import { AIEmployeesSection } from "@/components/marketing/ai-employees/AIEmployeesSection";
import { HowItWorksSection } from "@/components/marketing/how-it-works/HowItWorksSection";
import { OmnichannelSection } from "@/components/marketing/omnichannel/OmnichannelSection";
import { PlatformFeatureTabs } from "@/components/marketing/platform/PlatformFeatureTabs";
import { IndustriesSection } from "@/components/marketing/industries/IndustriesSection";
import { HumanHandoffSection } from "@/components/marketing/handoff/HumanHandoffSection";
import { IntegrationsSection } from "@/components/marketing/integrations/IntegrationsSection";
import { AnalyticsSection } from "@/components/marketing/analytics/AnalyticsSection";
import { SecuritySection } from "@/components/marketing/security/SecuritySection";
import { UseCasesSection } from "@/components/marketing/use-cases/UseCasesSection";
import { PricingPreviewSection } from "@/components/marketing/pricing/PricingPreviewSection";
import { FAQSection } from "@/components/marketing/faq/FAQSection";
import { FinalCTASection } from "@/components/marketing/cta/FinalCTASection";
import { JsonLd } from "@/components/marketing/faq/JsonLd";
import {
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  getSiteUrl,
} from "@/lib/marketing/seo";

const title = "AgentDesk AI | Build AI Employees for Calls, Sales, Support and Scheduling";
const description =
  "Create AI receptionists, sales agents, support agents and schedulers that work across phone, SMS, WhatsApp, chat and CRM. Automate customer conversations and business workflows with AgentDesk AI.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: getSiteUrl() },
  openGraph: {
    title,
    description,
    type: "website",
    url: getSiteUrl(),
    siteName: "AgentDesk AI",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildSoftwareApplicationJsonLd()} />
      <JsonLd data={buildFaqJsonLd()} />
      <HeroSection />
      <TrustedBySection />
      <OutcomesSection />
      <AIEmployeesSection />
      <HowItWorksSection />
      <OmnichannelSection />
      <PlatformFeatureTabs />
      <IndustriesSection />
      <HumanHandoffSection />
      <IntegrationsSection />
      <AnalyticsSection />
      <SecuritySection />
      <UseCasesSection />
      <PricingPreviewSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
