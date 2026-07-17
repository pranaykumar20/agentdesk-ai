import {
  PhoneCall,
  UserCheck,
  CalendarDays,
  GitBranch,
  MessageCircleQuestion,
  Send,
  Contact,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { OUTCOMES } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

const OUTCOME_ICONS: Array<{ icon: LucideIcon; tone: IconToneKey }> = [
  { icon: PhoneCall, tone: "violet" },
  { icon: UserCheck, tone: "emerald" },
  { icon: CalendarDays, tone: "sky" },
  { icon: GitBranch, tone: "indigo" },
  { icon: MessageCircleQuestion, tone: "amber" },
  { icon: Send, tone: "teal" },
  { icon: Contact, tone: "blue" },
  { icon: Moon, tone: "slate" },
];

export function OutcomesSection() {
  return (
    <section id="outcomes" className="scroll-mt-24 border-b border-border py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Business outcomes"
          title="What your AI workforce can do"
          description="Configurable AI employees handle the repetitive work so your team can focus on high-value conversations."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {OUTCOMES.map((item, index) => {
            const meta = OUTCOME_ICONS[index] ?? OUTCOME_ICONS[0];
            const Icon = meta.icon;
            const tone = iconTone(meta.tone);
            return (
              <li key={item.title} className="marketing-card rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone.bg, tone.icon)}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
