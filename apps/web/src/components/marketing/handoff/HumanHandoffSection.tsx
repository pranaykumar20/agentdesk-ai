import { HANDOFF } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { Check } from "lucide-react";

export function HumanHandoffSection() {
  return (
    <section id="handoff" className="scroll-mt-24 border-b border-border py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeader
            align="left"
            eyebrow="Safety and handoff"
            title={HANDOFF.title}
            description={HANDOFF.description}
          />
          <ul className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {HANDOFF.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
