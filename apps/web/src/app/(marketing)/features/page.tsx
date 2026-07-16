import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { FEATURES, HOW_IT_WORKS } from "@/lib/marketing/features";
import { LANDING_STATS } from "@/lib/marketing/landing";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Everything you need in an AI phone receptionist — answering, routing, booking, summaries, analytics, and more.",
  openGraph: {
    title: "AgentDesk AI Features",
    description: "Powerful features for AI call answering, routing, booking, and analytics.",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_100%)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Powerful features"
            title={
              <>
                Everything you need in an{" "}
                <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  AI phone receptionist
                </span>
              </>
            }
            description="Built for every business. Easy to set up. Powerful to scale."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const id = feature.href.split("#")[1];
              return (
                <article
                  key={feature.title}
                  id={id}
                  className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                eyebrow="How our AI works for you"
                title="From first ring to resolved outcome"
                description="Connect your number, configure your agent, go live, and get notified on every important call."
              />
              <ol className="mt-10 space-y-4">
                {HOW_IT_WORKS.map((step) => (
                  <li key={step.step} className="flex gap-4 rounded-xl border border-border bg-background p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Performance</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {LANDING_STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
