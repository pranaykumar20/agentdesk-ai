import Link from "next/link";
import { cn } from "@/lib/utils";

export function PlanUsageCard({
  planName,
  minutesUsed,
  minutesIncluded,
  className,
}: {
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
  className?: string;
}) {
  const pct = minutesIncluded > 0 ? Math.min(100, Math.round((minutesUsed / minutesIncluded) * 100)) : 0;
  const tone = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-primary";

  return (
    <div className={cn("min-w-0 rounded-xl border border-border bg-background p-2.5 md:p-3", className)}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="truncate text-xs font-semibold text-foreground" title={planName}>
          {planName}
        </p>
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <p className="mt-1 truncate text-[11px] leading-snug text-muted-foreground md:text-xs">
        <span className="tabular-nums">
          {minutesUsed.toLocaleString()} / {minutesIncluded.toLocaleString()}
        </span>{" "}
        mins used
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Plan minutes used"
      >
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <Link
        href="/dashboard/billing"
        className="mt-2.5 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        Upgrade Plan
      </Link>
    </div>
  );
}
