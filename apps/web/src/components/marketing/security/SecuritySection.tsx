import { SECURITY_POINTS } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { CtaLink } from "@/components/marketing/shared/CtaLink";

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Security"
          title="Built for secure and dependable business operations"
          description="Designed with security best practices and compliance-ready controls. We do not claim unfinished certifications."
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SECURITY_POINTS.map((point) => (
            <li key={point.title} className="marketing-card rounded-xl border border-border bg-background p-5">
              <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <CtaLink href="/security" variant="secondary">
            Read security overview
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
