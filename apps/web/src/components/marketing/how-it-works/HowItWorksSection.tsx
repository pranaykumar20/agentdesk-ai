import {
  BarChart3,
  Brain,
  Check,
  Database,
  Link2,
  Lock,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  HOW_IT_WORKS,
  HOW_IT_WORKS_SECTION,
  HOW_IT_WORKS_VALUE_PROPS,
  WORKFLOW_PIPELINE,
} from "@/content/marketing/homepage";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

const STEP_ICONS: LucideIcon[] = [Link2, Sparkles, Play, BarChart3];
const STEP_TONES: IconToneKey[] = ["violet", "sky", "amber", "emerald"];

const PIPELINE_ICONS: Record<string, LucideIcon> = {
  calls: Phone,
  understands: Brain,
  action: Check,
  transfer: UserRound,
  updates: Database,
  followup: MessageCircle,
};

const VALUE_ICONS: Record<string, LucideIcon> = {
  launch: Zap,
  nocode: ShieldCheck,
  human: Users,
  enterprise: Lock,
  results: BarChart3,
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-b border-border bg-background py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {HOW_IT_WORKS_SECTION.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {HOW_IT_WORKS_SECTION.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {HOW_IT_WORKS_SECTION.description}
          </p>
        </div>

        <ol className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden border-t-2 border-dotted border-primary/25 xl:block"
            aria-hidden
          />
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Sparkles;
            const tone = iconTone(STEP_TONES[index] ?? "violet");
            return (
              <li key={step.step} className="relative">
                <article className="marketing-card flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.35)]">
                  <span
                    className={cn(
                      "absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      tone.bg,
                      tone.icon,
                    )}
                  >
                    {step.step}
                  </span>
                  <div
                    className={cn(
                      "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
                      tone.bg,
                      tone.icon,
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-center text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-2xl border border-border bg-card/80 p-5 shadow-sm md:p-7">
          <h3 className="text-lg font-semibold text-foreground">
            What happens when a customer reaches out
          </h3>

          <ol className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div
              className="pointer-events-none absolute left-[6%] right-[6%] top-[2.75rem] hidden border-t-2 border-dotted border-primary/20 xl:block"
              aria-hidden
            />
            {WORKFLOW_PIPELINE.map((item) => {
              const Icon = PIPELINE_ICONS[item.id] ?? Phone;
              const tone = iconTone(item.tone as IconToneKey);
              return (
                <li key={item.id} className="relative">
                  <article
                    className={cn(
                      "marketing-card flex h-full flex-col items-center rounded-2xl border px-3 py-4 text-center",
                      tone.border,
                      tone.softBg,
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm",
                        tone.icon,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h4 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="relative mt-6 flex justify-center">
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 hidden border-t-2 border-dotted border-primary/25 xl:block"
              aria-hidden
            />
            <p className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {HOW_IT_WORKS_SECTION.loopBadge}
            </p>
          </div>
        </div>

        <ul className="mt-10 grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.05] p-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3 lg:p-6">
          {HOW_IT_WORKS_VALUE_PROPS.map((item) => {
            const Icon = VALUE_ICONS[item.id] ?? Zap;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
