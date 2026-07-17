import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, Clock3, LineChart, MessagesSquare } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { AuditForm } from "@/components/marketing/AuditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book a Demo",
  description:
    "Book a demo of AgentDesk AI. See how AI employees answer calls, qualify leads, book appointments, and hand off to humans.",
};

const CAL_EMBED_URL = process.env.NEXT_PUBLIC_CAL_EMBED_URL?.trim();

const COVER_ITEMS: Array<{ label: string; tone: IconToneKey }> = [
  { label: "Where leads are going cold", tone: "sky" },
  { label: "Manual tasks eating your team's time", tone: "amber" },
  { label: "Website conversion gaps", tone: "rose" },
  { label: "Recommended voice + SMS + CRM setup", tone: "violet" },
  { label: "Fixed scope and price if you proceed", tone: "emerald" },
];

const HIGHLIGHTS = [
  {
    icon: Clock3,
    title: "30 minutes",
    description: "Focused strategy call — no pitch deck marathon.",
    tone: "emerald" as const,
  },
  {
    icon: LineChart,
    title: "Clear gaps",
    description: "See where revenue leaks in your current lead flow.",
    tone: "amber" as const,
  },
  {
    icon: MessagesSquare,
    title: "Actionable plan",
    description: "Walk away with a concrete automation recommendation.",
    tone: "sky" as const,
  },
];

export default function AuditPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_45%,#f9fafb_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Book a demo
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See how an AI workforce can run your customer conversations
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            30-minute walkthrough of AI employees, human handoff, omnichannel inbox, and ROI
            reporting — tailored to your industry.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              const tone = iconTone(item.tone);
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      tone.bg,
                      tone.icon,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-2 lg:gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">What we cover</CardTitle>
              <CardDescription>
                A practical walkthrough of your current call and lead workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {COVER_ITEMS.map((item) => {
                  const tone = iconTone(item.tone);
                  return (
                    <li key={item.label} className="flex items-start gap-3 text-sm text-foreground">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          tone.bg,
                          tone.icon,
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span>{item.label}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Prefer self-serve?{" "}
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    Start your free trial
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>{" "}
                  and go live in under an hour.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Book your demo</CardTitle>
              <CardDescription>
                {CAL_EMBED_URL
                  ? "Pick a time that works for you."
                  : "Tell us a bit about your business and we’ll follow up to schedule."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {CAL_EMBED_URL ? (
                <iframe
                  src={CAL_EMBED_URL}
                  className="h-[480px] w-full rounded-xl border border-border bg-background"
                  title="Book demo"
                />
              ) : (
                <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
                  <AuditForm />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
