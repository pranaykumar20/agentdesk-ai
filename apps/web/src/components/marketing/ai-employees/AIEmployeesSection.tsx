"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck2,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  Home,
  Link2,
  MessageSquare,
  MoonStar,
  Phone,
  Sparkles,
  Target,
  Ticket,
  UserRound,
  Users,
  Video,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AI_EMPLOYEES, AI_EMPLOYEES_CUSTOM_CTA } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { track } from "@/lib/analytics/track";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { badgeIcon: LucideIcon; capabilityIcons: LucideIcon[] }> = {
  receptionist: {
    badgeIcon: Sparkles,
    capabilityIcons: [Phone, Video, Clock3],
  },
  sales: {
    badgeIcon: Target,
    capabilityIcons: [Target, FileText, CalendarCheck2],
  },
  appointment: {
    badgeIcon: CalendarCheck2,
    capabilityIcons: [CalendarCheck2, CalendarClock, Bell],
  },
  support: {
    badgeIcon: MessageSquare,
    capabilityIcons: [MessageSquare, Wrench, Ticket],
  },
  billing: {
    badgeIcon: CircleDollarSign,
    capabilityIcons: [CreditCard, Link2, Zap],
  },
  collections: {
    badgeIcon: ClipboardList,
    capabilityIcons: [Bell, ClipboardList, FileText],
  },
  property: {
    badgeIcon: Home,
    capabilityIcons: [Wrench, UserRound, Home],
  },
  "after-hours": {
    badgeIcon: MoonStar,
    capabilityIcons: [MoonStar, Zap, Bell],
  },
};

export function AIEmployeesSection() {
  return (
    <section id="ai-employees" className="scroll-mt-24 border-b border-border bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Build your AI workforce"
          title="Create the AI employees your business needs"
          description="Choose from ready-to-use AI employees or create custom ones for your unique workflows."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {AI_EMPLOYEES.map((employee) => {
            const meta = ROLE_META[employee.id] ?? ROLE_META.receptionist;
            const BadgeIcon = meta.badgeIcon;
            const tone = iconTone(employee.tone as IconToneKey);

            return (
              <li key={employee.id}>
                <article
                  className={cn(
                    "marketing-card relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm",
                    tone.border,
                    tone.softBorder,
                  )}
                >
                  {employee.popular ? (
                    <span
                      className={cn(
                        "absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        tone.bg,
                        tone.icon,
                      )}
                    >
                      Popular
                    </span>
                  ) : null}

                  <div className="relative h-16 w-16">
                    <Image
                      src={employee.avatarSrc}
                      alt={`${employee.title} profile`}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover shadow-sm ring-4 ring-white"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm",
                        tone.bg,
                        tone.icon,
                      )}
                    >
                      <BadgeIcon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground">{employee.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {employee.description}
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {employee.capabilities.map((capability, index) => {
                      const CapIcon = meta.capabilityIcons[index] ?? Phone;
                      return (
                        <li key={capability} className="flex items-start gap-2.5 text-sm text-foreground">
                          <CapIcon className={cn("mt-0.5 h-4 w-4 shrink-0", tone.icon)} aria-hidden />
                          <span>{capability}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-auto pt-5">
                    <Link
                      href={employee.href}
                      className={cn(
                        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border bg-background text-sm font-semibold transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        tone.border,
                        tone.icon,
                      )}
                      onClick={() => track("employee_card_clicked", { employee: employee.id })}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          tone.bg,
                        )}
                        aria-hidden
                      >
                        <Phone className="h-3 w-3" />
                      </span>
                      Try a Demo Call
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/[0.04] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-foreground">{AI_EMPLOYEES_CUSTOM_CTA.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {AI_EMPLOYEES_CUSTOM_CTA.description}
              </p>
            </div>
          </div>
          <Link
            href={AI_EMPLOYEES_CUSTOM_CTA.href}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => track("employee_card_clicked", { employee: "custom" })}
          >
            {AI_EMPLOYEES_CUSTOM_CTA.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
