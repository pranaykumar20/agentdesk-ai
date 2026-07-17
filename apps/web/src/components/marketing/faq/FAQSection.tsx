"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HOMEPAGE_FAQ } from "@/content/marketing/faq";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24 border-b border-border py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions businesses ask before launching"
          description="Clear answers about AI employees, handoff, channels, and security."
        />
        <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
          {HOMEPAGE_FAQ.map((item, index) => {
            const open = openId === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => {
                      const next = open ? null : index;
                      setOpenId(next);
                      if (next != null) track("faq_opened", { question: item.question });
                    }}
                  >
                    {item.question}
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
