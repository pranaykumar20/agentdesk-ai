import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { INDUSTRIES } from "@/lib/marketing/industries";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "AgentDesk AI templates for dental, medical, insurance, home services, auto repair, restaurants, law, real estate, and property management.",
  openGraph: {
    title: "Industries — AgentDesk AI",
    description: "Pre-built, fully customizable AI receptionist templates for every industry.",
  },
};

export default function IndustriesPage() {
  return (
    <>
      <section className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_100%)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Built for every industry"
            title="Works for every industry"
            description="Pre-built templates. Fully customizable. Industry-neutral architecture with ready-to-use playbooks."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <article
                  key={industry.slug}
                  id={industry.slug}
                  className="scroll-mt-24 flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{industry.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{industry.description}</p>
                  <p className="mt-4 text-sm font-medium text-foreground">Common problem</p>
                  <p className="mt-1 text-sm text-muted-foreground">{industry.problem}</p>
                  <p className="mt-4 text-sm font-medium text-foreground">Typical call types</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {industry.callTypes.slice(0, 3).map((type) => (
                      <li key={type}>• {type}</li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-primary hover:underline"
                  >
                    View template
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm font-medium text-primary">
              Don’t see your industry? We can customize it for you.
            </p>
            <Link
              href="/audit"
              className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
            >
              View all industries / talk to us
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Launch with an industry template"
        description="Start from a proven playbook, then customize greetings, FAQs, and routing for your business."
      />
    </>
  );
}
