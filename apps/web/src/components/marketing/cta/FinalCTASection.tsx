import { FINAL_CTA } from "@/content/marketing/homepage";
import { CtaLink } from "@/components/marketing/shared/CtaLink";

export function FinalCTASection() {
  return (
    <section id="final-cta" className="scroll-mt-24 border-b border-border bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {FINAL_CTA.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {FINAL_CTA.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CtaLink href={FINAL_CTA.primaryCta.href} event="final_cta_clicked" eventProps={{ cta: "trial" }}>
            {FINAL_CTA.primaryCta.label}
          </CtaLink>
          <CtaLink
            href={FINAL_CTA.secondaryCta.href}
            variant="secondary"
            event="final_cta_clicked"
            eventProps={{ cta: "demo" }}
          >
            {FINAL_CTA.secondaryCta.label}
          </CtaLink>
          <CtaLink
            href={FINAL_CTA.enterpriseCta.href}
            variant="ghost"
            event="final_cta_clicked"
            eventProps={{ cta: "sales" }}
          >
            {FINAL_CTA.enterpriseCta.label}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
