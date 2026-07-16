"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnalyticsRange } from "@/modules/analytics/types";

const RANGES: Array<{ id: AnalyticsRange; label: string }> = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

export function AnalyticsRangeTabs({ range }: { range: AnalyticsRange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {RANGES.map((r) => (
        <Link
          key={r.id}
          href={`/dashboard/analytics?range=${r.id}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            range === r.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
