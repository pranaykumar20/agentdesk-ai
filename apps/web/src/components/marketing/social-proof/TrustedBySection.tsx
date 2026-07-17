import { Shield, UsersRound, Layers3, LineChart } from "lucide-react";
import { TRUST } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

const PILLAR_META: Array<{ tone: IconToneKey; icon: typeof Shield }> = [
  { tone: "blue", icon: Shield },
  { tone: "emerald", icon: UsersRound },
  { tone: "violet", icon: Layers3 },
  { tone: "amber", icon: LineChart },
];

export function TrustedBySection() {
  return (
    <section className="border-b border-border bg-card py-14" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader id="trust-heading" title={TRUST.title} description={TRUST.description} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.pillars.map((pillar, index) => {
            const meta = PILLAR_META[index] ?? PILLAR_META[0];
            const Icon = meta.icon;
            const tone = iconTone(meta.tone);
            return (
              <li key={pillar.label} className="marketing-card rounded-xl border border-border bg-background px-5 py-4">
                <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", tone.bg, tone.icon)}>
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-foreground">{pillar.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pillar.detail}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Logo cloud placeholders omitted until approved partner marks are available.
        </p>
      </div>
    </section>
  );
}
