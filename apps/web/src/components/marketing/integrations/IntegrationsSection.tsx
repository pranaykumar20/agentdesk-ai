"use client";

import Link from "next/link";
import { Plug, ShieldCheck } from "lucide-react";
import { INTEGRATIONS_SECTION } from "@/content/marketing/integrations";
import { IntegrationsCarousel } from "@/components/marketing/integrations/IntegrationsCarousel";
import { IntegrationsMarquee } from "@/components/marketing/integrations/IntegrationsMarquee";
import { track } from "@/lib/analytics/track";

export function IntegrationsSection() {
  return (
    <section
      id="integrations"
      className="scroll-mt-24 border-b border-border bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:22px_22px] py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Plug className="h-3.5 w-3.5" aria-hidden />
            {INTEGRATIONS_SECTION.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {INTEGRATIONS_SECTION.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {INTEGRATIONS_SECTION.description}
          </p>
        </div>

        <div className="mt-12">
          <IntegrationsCarousel />
        </div>

        <div className="mt-10">
          <IntegrationsMarquee />
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="text-left">
              <p className="font-semibold text-foreground">{INTEGRATIONS_SECTION.trustTitle}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {INTEGRATIONS_SECTION.trustDetail}
              </p>
            </div>
          </div>
          <Link
            href="/integrations"
            className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => track("integrations_clicked", { source: "homepage" })}
          >
            View all integrations
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Logos are trademarks of their respective owners and are used only to identify supported
          integrations.
        </p>
      </div>
    </section>
  );
}
