import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { PricingToggle } from "@/components/marketing/PricingToggle";
import { PRICING_FAQ, PRICING_PLANS } from "@/lib/marketing/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple AgentDesk AI plans — Starter, Professional, and Business. 14-day free trial. Monthly or annual billing.",
  openGraph: {
    title: "Pricing — AgentDesk AI",
    description: "Transparent pricing for AI receptionist minutes, numbers, agents, and team seats.",
  },
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_100%)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans. Measurable ROI."
            description="Display prices are for planning only. Stripe is the billing authority when you subscribe."
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <PricingToggle />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need a custom enterprise agreement?{" "}
            <Link href="/audit" className="font-medium text-primary hover:underline">
              Contact sales
            </Link>
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">Plan comparison</h2>
          <table className="mt-8 w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium text-muted-foreground">Included</th>
                {PRICING_PLANS.map((plan) => (
                  <th key={plan.id} className="px-3 py-3 font-semibold text-foreground">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {(
                [
                  ["AI minutes / mo", ...PRICING_PLANS.map((p) => p.minutesIncluded.toLocaleString())],
                  ["Phone numbers", ...PRICING_PLANS.map((p) => String(p.phoneNumbers))],
                  ["AI agents", ...PRICING_PLANS.map((p) => String(p.aiAgents))],
                  ["Team members", ...PRICING_PLANS.map((p) => String(p.teamMembers))],
                  ["Locations", ...PRICING_PLANS.map((p) => String(p.locations))],
                  ["Overage / min", ...PRICING_PLANS.map((p) => `$${p.overagePerMinuteUsd.toFixed(2)}`)],
                  ["Support", ...PRICING_PLANS.map((p) => p.supportLevel)],
                  ["Trial", ...PRICING_PLANS.map((p) => `${p.trialDays} days`)],
                ] as string[][]
              ).map((row) => (
                <tr key={row[0]} className="border-b border-border/70">
                  {row.map((cell, i) => (
                    <td key={`${row[0]}-${i}`} className={`py-3 ${i === 0 ? "pr-4 text-muted-foreground" : "px-3"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title="Pricing FAQ" description="Answers to common billing questions." />
          <div className="mt-10 space-y-4">
            {PRICING_FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-card p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Start your 14-day free trial" description="No credit card required. Cancel anytime." />
    </>
  );
}
