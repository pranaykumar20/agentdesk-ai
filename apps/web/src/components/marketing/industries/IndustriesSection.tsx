"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Wrench,
  HeartPulse,
  Car,
  Building2,
  Scale,
  Home,
  UtensilsCrossed,
  MapPinned,
  type LucideIcon,
} from "lucide-react";
import { INDUSTRY_HOME_CARDS } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { track } from "@/lib/analytics/track";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

const INDUSTRY_ICONS: Record<string, { icon: LucideIcon; tone: IconToneKey }> = {
  insurance: { icon: Shield, tone: "blue" },
  "home-services": { icon: Wrench, tone: "amber" },
  dental: { icon: HeartPulse, tone: "rose" },
  "auto-repair": { icon: Car, tone: "orange" },
  "property-management": { icon: Building2, tone: "slate" },
  law: { icon: Scale, tone: "indigo" },
  "real-estate": { icon: Home, tone: "teal" },
  restaurants: { icon: UtensilsCrossed, tone: "pink" },
  "multi-location": { icon: MapPinned, tone: "violet" },
};

export function IndustriesSection() {
  return (
    <section id="industries" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Industries"
          title="Built for the way your industry works"
          description="Use industry-ready playbooks for common call types, then customize for your locations and team."
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {INDUSTRY_HOME_CARDS.map((industry) => {
            const meta = INDUSTRY_ICONS[industry.slug] ?? { icon: Building2, tone: "violet" as const };
            const Icon = meta.icon;
            const tone = iconTone(meta.tone);
            return (
              <li key={industry.slug}>
                <Link
                  href={`/industries#${industry.slug}`}
                  className="marketing-card flex h-full flex-col rounded-xl border border-border bg-background p-5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => track("industry_card_clicked", { industry: industry.slug })}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone.bg, tone.icon)}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{industry.name}</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-foreground">Common call types</dt>
                      <dd className="text-muted-foreground">{industry.callTypes}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Key automation</dt>
                      <dd className="text-muted-foreground">{industry.automation}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Business result</dt>
                      <dd className="text-muted-foreground">{industry.result}</dd>
                    </div>
                  </dl>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View solution <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
