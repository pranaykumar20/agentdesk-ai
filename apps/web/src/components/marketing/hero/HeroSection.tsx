import { Check } from "lucide-react";
import { HERO } from "@/content/marketing/homepage";
import { CtaLink } from "@/components/marketing/shared/CtaLink";
import { HeroProductDemo } from "./HeroProductDemo";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_50%,#f9fafb_100%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {HERO.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {HERO.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {HERO.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={HERO.primaryCta.href} event="hero_start_trial_clicked">
              {HERO.primaryCta.label}
            </CtaLink>
            <CtaLink
              href={HERO.secondaryCta.href}
              variant="secondary"
              event="hero_demo_clicked"
            >
              {HERO.secondaryCta.label}
            </CtaLink>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {HERO.trustNotes.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroProductDemo />
      </div>
    </section>
  );
}
