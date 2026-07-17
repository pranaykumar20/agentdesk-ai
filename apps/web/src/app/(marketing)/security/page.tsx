import type { Metadata } from "next";
import { SECURITY_POINTS } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { CtaLink } from "@/components/marketing/shared/CtaLink";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Learn how AgentDesk AI is designed with tenant isolation, RBAC, encryption, and compliance-ready controls.",
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeader
        align="left"
        eyebrow="Security"
        title="Built for secure and dependable business operations"
        description="Designed with security best practices and compliance-ready controls. This page does not claim unfinished certifications such as SOC 2, HIPAA, or PCI."
      />
      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {SECURITY_POINTS.map((point) => (
          <li key={point.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{point.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
          </li>
        ))}
      </ul>

      <section id="privacy" className="mt-16 scroll-mt-24 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold text-foreground">Privacy</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We process business and conversation data to provide the AgentDesk AI service. Contact us for
          data processing details, retention preferences, and privacy requests.
        </p>
      </section>

      <section id="terms" className="mt-6 scroll-mt-24 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold text-foreground">Terms</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Use of AgentDesk AI is subject to your subscription agreement and acceptable use policies.
          Contact sales for enterprise terms.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <CtaLink href="/audit?intent=sales" event="final_cta_clicked" eventProps={{ cta: "security_sales" }}>
          Talk to Sales
        </CtaLink>
        <CtaLink href="/signup" variant="secondary" event="signup_started" eventProps={{ source: "security" }}>
          Start Free Trial
        </CtaLink>
      </div>
    </div>
  );
}
