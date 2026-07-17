"use client";

import { useState } from "react";
import { PLATFORM_GROUPS } from "@/content/marketing/platform";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { cn } from "@/lib/utils";

export function PlatformFeatureTabs() {
  const [active, setActive] = useState(PLATFORM_GROUPS[0].id);
  const group = PLATFORM_GROUPS.find((g) => g.id === active) ?? PLATFORM_GROUPS[0];

  return (
    <section id="platform" className="scroll-mt-24 border-b border-border py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Platform"
          title="Everything you need to run an AI workforce"
          description="Build, automate, communicate, manage, and measure—without stitching together disconnected tools."
        />

        <div
          className="mt-10 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1.5"
          role="tablist"
          aria-label="Platform capability groups"
        >
          {PLATFORM_GROUPS.map((item) => {
            const selected = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`platform-tab-${item.id}`}
                aria-controls={`platform-panel-${item.id}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setActive(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`platform-panel-${group.id}`}
          aria-labelledby={`platform-tab-${group.id}`}
          className="mt-8"
        >
          <p className="max-w-2xl text-base text-muted-foreground">{group.summary}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {group.capabilities.map((cap) => (
              <li key={cap.id} className="marketing-card rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-base font-semibold text-foreground">{cap.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{cap.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
