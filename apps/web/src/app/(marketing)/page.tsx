import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PhoneHeroVisual } from "@/components/marketing/PhoneHeroVisual";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { HERO_CALLOUTS, LANDING_FEATURES, LANDING_STATS, TRUST_LOGOS } from "@/lib/marketing/landing";
import { INDUSTRIES } from "@/lib/marketing/industries";
import { HOW_IT_WORKS } from "@/lib/marketing/features";
import { PRICING_PLANS } from "@/lib/marketing/pricing";

export const metadata: Metadata = {
  title: "AgentDesk AI — Never miss a call. AI handles it all.",
  description:
    "AgentDesk AI answers calls, qualifies leads, books appointments, and routes callers—24/7. Built for every service business.",
  openGraph: {
    title: "AgentDesk AI — AI Receptionist for Every Business",
    description:
      "Never miss a call. AI answers, books appointments, captures leads, and routes to your team.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_45%,#f9fafb_100%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              AI receptionist for every business
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Never miss a call.{" "}
              <span className="text-primary">AI handles it all.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              AgentDesk AI answers calls, qualifies leads, books appointments, and routes callers to
              the right person—24/7. Save time. Capture more leads. Grow your business.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/audit"
                className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Book a Demo
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <PhoneHeroVisual />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {HERO_CALLOUTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur"
                  >
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-border bg-card py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Trusted by 2,000+ businesses
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_LOGOS.map((logo) => (
              <span key={logo.name} className="text-sm font-semibold tracking-wide text-slate-400">
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything your front desk needs"
            description="One platform to answer, qualify, book, route, and report."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/features" className="text-sm font-semibold text-primary hover:underline">
              Explore all features →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="How it works"
            title="Live in minutes, not months"
            description="Connect a number, configure your AI, and start answering."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.step} className="rounded-2xl border border-border bg-background p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.step}
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Industries teaser */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Industries"
            title="Works for every industry"
            description="Pre-built templates. Fully customizable."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.slice(0, 6).map((industry) => {
              const Icon = industry.icon;
              return (
                <Link
                  key={industry.slug}
                  href={`/industries#${industry.slug}`}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 font-semibold text-foreground">{industry.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{industry.description}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/industries" className="text-sm font-semibold text-primary hover:underline">
              View all industries →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-slate-950 py-14 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-violet-300">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans. Clear ROI."
            description="Start free. Scale as your call volume grows."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-card p-6 ${plan.popular ? "border-primary" : "border-border"}`}
              >
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-3 text-3xl font-bold text-foreground">
                  ${plan.monthlyPriceUsd}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.minutesIncluded.toLocaleString()} mins included</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
