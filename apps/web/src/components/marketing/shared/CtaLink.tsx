"use client";

import Link from "next/link";
import { track, type MarketingEventName } from "@/lib/analytics/track";
import { withUtm } from "@/lib/marketing/utm";
import { cn } from "@/lib/utils";

export function CtaLink({
  href,
  children,
  event,
  eventProps,
  className,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  event?: MarketingEventName;
  eventProps?: Record<string, string | number | boolean | undefined>;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:bg-muted",
        variant === "ghost" && "text-primary hover:underline",
        className,
      )}
      onClick={() => {
        const dest = withUtm(href);
        if (event) track(event, { href: dest, ...eventProps });
        if (event === "hero_start_trial_clicked" || event === "final_cta_clicked") {
          if (href.includes("signup")) track("signup_started", { source: event });
        }
      }}
    >
      {children}
    </Link>
  );
}
