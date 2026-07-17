"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ANNOUNCEMENT } from "@/content/marketing/homepage";
import { track } from "@/lib/analytics/track";

const STORAGE_KEY = "agentdesk_announce_dismissed_v1";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-primary/15 bg-accent text-sm text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p className="min-w-0 flex-1 text-center sm:text-left">
          <span className="text-foreground/80">{ANNOUNCEMENT.text}</span>{" "}
          <Link
            href={ANNOUNCEMENT.ctaHref}
            className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => track("announcement_cta_clicked")}
          >
            {ANNOUNCEMENT.ctaLabel}
          </Link>
        </p>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss announcement"
          onClick={() => {
            try {
              sessionStorage.setItem(STORAGE_KEY, "1");
            } catch {
              // ignore
            }
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
