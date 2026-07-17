"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  PhoneCall,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ANALYTICS_SECTION } from "@/content/marketing/homepage";
import { AnalyticsDashboardPreview } from "@/components/marketing/analytics/AnalyticsDashboardPreview";
import { CtaLink } from "@/components/marketing/shared/CtaLink";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

const METRIC_ICONS: Record<string, LucideIcon> = {
  calls: PhoneCall,
  appointments: CalendarCheck2,
  leads: Users,
  response: Clock3,
  revenue: Wallet,
  cost: PiggyBank,
};

export function AnalyticsSection() {
  return (
    <section
      id="analytics"
      className="scroll-mt-24 border-b border-border bg-[radial-gradient(circle_at_1px_1px,rgba(92,78,229,0.08)_1px,transparent_0)] [background-size:22px_22px] bg-gradient-to-b from-[#f5f3ff]/70 via-background to-background py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              {ANALYTICS_SECTION.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
              {ANALYTICS_SECTION.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {ANALYTICS_SECTION.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                href={ANALYTICS_SECTION.primaryCta.href}
                event="final_cta_clicked"
                eventProps={{ source: "analytics_section" }}
                className="gap-2"
              >
                {ANALYTICS_SECTION.primaryCta.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </CtaLink>
              <CtaLink
                href={ANALYTICS_SECTION.secondaryCta.href}
                variant="secondary"
                event="hero_demo_clicked"
                eventProps={{ source: "analytics_section" }}
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                {ANALYTICS_SECTION.secondaryCta.label}
              </CtaLink>
            </div>
          </div>

          <AnalyticsDashboardPreview />
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ANALYTICS_SECTION.highlightMetrics.map((metric) => {
            const Icon = METRIC_ICONS[metric.id] ?? BarChart3;
            const tone = iconTone(metric.tone as IconToneKey);
            const TrendIcon = "improvedDown" in metric && metric.improvedDown ? TrendingDown : TrendingUp;
            return (
              <li
                key={metric.id}
                className="marketing-card rounded-2xl border border-border/80 bg-card px-4 py-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      tone.bg,
                      tone.icon,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <TrendIcon className="h-3.5 w-3.5" aria-hidden />
                      {metric.change}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6 lg:p-7">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ANALYTICS_SECTION.pillars.map((pillar) => (
              <li key={pillar.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:max-w-xs">
            <p className="text-sm font-semibold leading-snug text-foreground">
              {ANALYTICS_SECTION.bannerTitle}
            </p>
            <Link
              href={ANALYTICS_SECTION.primaryCta.href}
              className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() =>
                track("final_cta_clicked", { source: "analytics_banner" })
              }
            >
              View Full Analytics
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {ANALYTICS_SECTION.disclaimer}
        </p>
      </div>
    </section>
  );
}
