"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/marketing/pricing";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { CtaLink } from "@/components/marketing/shared/CtaLink";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export function PricingPreviewSection() {
  return (
    <section id="pricing-preview" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Plans that scale with your AI workforce"
          description="Start with the capacity you need. Upgrade as you add employees, locations, and channels."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "marketing-card flex flex-col rounded-2xl border bg-background p-6 shadow-sm",
                plan.popular ? "border-primary ring-1 ring-primary/30" : "border-border",
              )}
            >
              {plan.popular ? (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                  Most popular
                </p>
              ) : null}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-5">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  ${plan.monthlyPriceUsd}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                <li className="text-sm text-muted-foreground">
                  {plan.minutesIncluded.toLocaleString()} AI minutes · {plan.aiAgents} AI employees
                </li>
                <li className="text-sm text-muted-foreground">
                  {plan.phoneNumbers} phone numbers · {plan.locations} locations
                </li>
                <li className="text-sm text-muted-foreground">{plan.supportLevel} support</li>
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-6 inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-muted",
                )}
                onClick={() => track("pricing_plan_clicked", { plan: plan.id })}
              >
                Start free trial
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CtaLink href="/pricing" variant="secondary" event="navigation_pricing_clicked">
            View full pricing
          </CtaLink>
          <CtaLink href="/audit?intent=sales" variant="ghost">
            Contact sales
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
