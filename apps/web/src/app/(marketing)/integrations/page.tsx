import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { CtaLink } from "@/components/marketing/shared/CtaLink";
import { IntegrationsGrid } from "@/components/marketing/integrations/IntegrationsGrid";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect AgentDesk AI with calendars, CRMs, messaging, billing, and custom webhooks.",
};

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeader
        align="left"
        eyebrow="Integrations"
        title="Connect the tools your business already uses"
        description="AgentDesk AI works with common scheduling, CRM, messaging, and automation tools—plus custom webhooks for your stack."
      />
      <div className="mt-12">
        <IntegrationsGrid columns="page" />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Logos are trademarks of their respective owners and are used only to identify supported
        integrations.{" "}
        <Link href="/audit" className="font-medium text-primary hover:underline">
          Ask about your stack
        </Link>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href="/signup" event="signup_started" eventProps={{ source: "integrations" }}>
          Start Free Trial
        </CtaLink>
        <CtaLink href="/audit" variant="secondary" event="hero_demo_clicked">
          Book a Demo
        </CtaLink>
      </div>
    </div>
  );
}
