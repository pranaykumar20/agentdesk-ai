"use client";

import Link from "next/link";
import { Bell, HelpCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopBar({
  title,
  orgName,
  onMenuClick,
  className,
}: {
  title: string;
  orgName: string;
  onMenuClick: () => void;
  className?: string;
}) {
  const initial = orgName.charAt(0).toUpperCase() || "O";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/dashboard/settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>
        <div className="ml-1 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground sm:inline">
            {orgName}
          </span>
        </div>
      </div>
    </header>
  );
}
